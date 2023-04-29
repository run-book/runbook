import { Command } from "commander";
import { CleanConfig, configFile, configFileName, configSubDir, findRunbookDirectory, validateConfig, validationConfigPartial } from "@runbook/config";
import { addFromMutator, consoleLogValidationAndShouldExit, defaultMergeAccept, displayFilesAndResultsForValidation, DisplayValidation, mergeJsonFiles, validateJsonFiles } from "@runbook/files";
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
      const dir = findRunbookDirectory ( cwd )
      const validation = await validateJsonFiles ( configSubDir ( dir ), defaultMergeAccept, validateConfig ( true ) )
      const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
      consoleLogValidationAndShouldExit ( dispValidation, true )
    } )
  const configComposeCmd: Command = configCmd.command ( 'compose' )
    .description ( 'Merges all the files in the .runbook directory to make the .runbook.json' )
    .option ( '-f|--force', 'force the merge even if there are errors' )
    .action ( async () => {
      const dir = findRunbookDirectory ( cwd )
      if ( !configComposeCmd.optsWithGlobals ().force ) {
        const validation = await validateJsonFiles ( configSubDir ( dir ), defaultMergeAccept, validationConfigPartial )
        const dispValidation: ErrorsAnd<DisplayValidation> = displayFilesAndResultsForValidation ( validation )
        if ( consoleLogValidationAndShouldExit ( dispValidation, false, 'Use --force to force the merge' ) ) return
      }
      const newConfig = await mergeJsonFiles ( configSubDir(dir), addFromMutator )
      if ( isErrors ( newConfig ) ) {
        console.log ( 'Errors composing' )
        newConfig.errors.forEach ( x => console.log ( x ) )
        return
      }
      const filename = configFile ( dir )
      fs.writeFileSync ( filename, JSON.stringify ( newConfig, null, 2 ) )
      console.log ( 'created new', filename )

    } )
}