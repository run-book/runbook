import { Command } from "commander";
import { cachedConfigFile, CleanConfig, configSubDir, configSubDirFromRoot, findRunbookDirectoryOrThrow, runbookConfigFile, validateConfig } from "@runbook/config";
import { addFromMutator, consoleLogValidationAndShouldExit, defaultMergeAccept, displayFilesAndResultsForValidation, DisplayValidation, loadAndParseFileOrDefaultIfNoFile, mergeJsonDirs, validateJsonDirs } from "@runbook/files";
import { ErrorsAnd, flatten, isErrors, mapArrayErrorsK, safeArray } from "@runbook/utils";
import fs from "fs";
import { defaultCloneGitRepoAndparentsIfNeeded, DefaultParents, makeGitOps } from "@runbook/git";
import * as os from "os";

export interface ComposeOptions {
  homeDir?: string
}
export interface ForceOptions {
  force?: boolean
}

async function loadParentsAndFindAllDirsToBeComposed ( cwd: string, options: ComposeOptions ) {
  const dir = findRunbookDirectoryOrThrow ( cwd )
  const homeDir = options.homeDir || os.homedir ()
  const gitOps = makeGitOps ( homeDir )
  await fs.promises.mkdir ( configSubDir ( dir ), { recursive: true } )
  const baseConfig = await loadAndParseFileOrDefaultIfNoFile<DefaultParents> ( runbookConfigFile ( dir ), () => ({}) )
  if ( isErrors ( baseConfig ) ) throw new Error ( baseConfig.errors.join ( '\n' ) )
  const parents = safeArray ( baseConfig.parents )
  const x = await mapArrayErrorsK ( parents, defaultCloneGitRepoAndparentsIfNeeded ( gitOps ) )
  if ( isErrors ( x ) ) throw new Error ( x.errors.join ( '\n' ) )
  const repoDirs = flatten ( x ).map ( gitOps.gitDir )
  const allDirs = [ configSubDir ( dir ), ...repoDirs.map ( configSubDirFromRoot ) ]
  return allDirs;
}
async function validateBeforeCompose ( options: ComposeOptions, cwd: string ) {
  const allDirs = await loadParentsAndFindAllDirsToBeComposed ( cwd, options );
  // console.log ( 'validating ', allDirs )
  const validation = await validateJsonDirs ( allDirs, defaultMergeAccept, validateConfig ( true ) )
  const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
  consoleLogValidationAndShouldExit ( dispValidation, true )
}
async function compose ( cwd: string, options: ComposeOptions & ForceOptions ) {
  const dir = findRunbookDirectoryOrThrow ( cwd )
  const allDirs = await loadParentsAndFindAllDirsToBeComposed ( cwd, options );
  if ( !options?.force ) {
    // console.log ( 'validating ', allDirs )
    const validation = await validateJsonDirs ( allDirs, defaultMergeAccept, validateConfig ( true ) )

    const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
    if ( consoleLogValidationAndShouldExit ( dispValidation, false, 'Use --force to force the merge' ) ) return
  }
  const newConfig = await mergeJsonDirs ( allDirs, addFromMutator )
  if ( isErrors ( newConfig ) ) {
    console.log ( 'Errors composing' )
    newConfig.errors.forEach ( x => console.log ( x ) )
    return
  }
  const filename = cachedConfigFile ( dir )
  fs.writeFileSync ( filename, JSON.stringify ( newConfig, null, 2 ) )
  console.log ( 'created new', filename )
}
export function addConfigCommand ( configCmd: Command, cleanConfig: CleanConfig, cwd: string ) {
  const configIssuesCmd = configCmd.command ( 'issues' )
    .description ( 'Shows issues with the current cleanConfig' )
    .action ( async () => {
      const errors = validateConfig () ( 'config' ) ( cleanConfig )
      const msg = [ errors.length === 0 ? 'No errors' : 'Errors in config', ...errors ]
      msg.forEach ( x => console.log ( x ) )
    } )

  const validateBeforeComposeCmd = configCmd.command ( 'validateBeforeCompose' )
    .description ( 'validates the small files that will be merged into the compose' )
    .action ( async () => {
      await validateBeforeCompose ( configComposeCmd.optsWithGlobals (), cwd );
    } )
  const configComposeCmd: Command = configCmd.command ( 'compose' )
    .description ( 'Merges all the files in the .runbook directory to make the .runbook.json' )
    .option ( '-f|--force', 'force the merge even if there are errors' )
    .action ( async () => {
      await compose ( cwd, configComposeCmd.optsWithGlobals () );

    } )
}