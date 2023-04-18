import { Command } from "commander";
import { CleanConfig, validateConfig } from "@runbook/config";
import { addFromMutator, defaultMergeAccept, findDirectoryHoldingFileOrThrow, mergeJsonFiles, validateJsonFiles } from "@runbook/files";
import { isErrors } from "@runbook/utils";
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

      console.log ( JSON.stringify ( validation, null, 2 ) )
    } )
  const configComposeCmd: Command = configCmd.command ( 'compose' )
    .description ( 'Merges all the files in the .runbook directory to make the .runbook.json' )
    .option ( '-f|--force', 'force the merge even if there are errors' )
    .action ( async () => {
      const dir = findDirectoryHoldingFileOrThrow ( cwd, '.runbook' ) + '/.runbook'
      const validation = await validateJsonFiles ( dir, defaultMergeAccept, validateConfig ( true ) )
      if ( isErrors ( validation ) ) {
        console.log ( 'Errors composing' )
        validation.errors.forEach ( x => console.log ( x ) )
        process.exit ( 1 )
      }
      const validationIssues = validation.filter ( v => v?.result?.length > 0 )
      if ( validationIssues.length > 0 ) {
        console.log ( 'Validation issues' )
        console.log ( validationIssues )
        if ( !configComposeCmd.optsWithGlobals ().force ) {
          console.log ( 'Use --force to force the merge' )
          process.exit ( 1 )
        }
      }
      const newConfig = await mergeJsonFiles ( dir, addFromMutator )
      if ( isErrors ( newConfig ) ) {
        console.log ( 'Errors composing' )
        newConfig.errors.forEach ( x => console.log ( x ) )
        process.exit ( 1 )
      }
      let filename = dir + '/runbook.json';
      fs.writeFileSync ( filename, JSON.stringify ( newConfig, null, 2 ) )
      console.log ( 'created new', filename )

    } )
}