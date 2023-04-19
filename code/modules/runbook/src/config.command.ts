import { Command } from "commander";
import { CleanConfig, validateConfig, validationConfigPartial } from "@runbook/config";
import { addFromMutator, consoleLogValidationAndShouldExit, defaultMergeAccept, displayFilesAndResultsForValidation, DisplayValidation, findDirectoryHoldingFileOrThrow, mergeJsonFiles, validateJsonFiles } from "@runbook/files";
import { ErrorsAnd, isErrors } from "@runbook/utils";
import fs from "fs";

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
      const dir = findDirectoryHoldingFileOrThrow ( cwd, '.runbook' ) + '/.runbook'
      const validation = await validateJsonFiles ( dir, defaultMergeAccept, validateConfig ( true ) )
      const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
      consoleLogValidationAndShouldExit ( dispValidation, true )
    } )
  const configComposeCmd: Command = configCmd.command ( 'compose' )
    .description ( 'Merges all the files in the .runbook directory to make the .runbook.json' )
    .option ( '-f|--force', 'force the merge even if there are errors' )
    .action ( async () => {
      const dir = findDirectoryHoldingFileOrThrow ( cwd, '.runbook' ) + '/.runbook'
      const validation = await validateJsonFiles ( dir, defaultMergeAccept, validationConfigPartial )
      const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
      let force = configComposeCmd.optsWithGlobals ().force && 'Use --force to force the merge'

      if ( consoleLogValidationAndShouldExit ( dispValidation, false, force ) ) return

      const newConfig = await mergeJsonFiles ( dir, addFromMutator )
      if ( isErrors ( newConfig ) ) {
        console.log ( 'Errors composing' )
        newConfig.errors.forEach ( x => console.log ( x ) )
        return
      }
      let filename = dir + '/runbook.json';
      fs.writeFileSync ( filename, JSON.stringify ( newConfig, null, 2 ) )
      console.log ( 'created new', filename )

    } )
}