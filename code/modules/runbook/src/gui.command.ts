import { Command } from "commander";
import { CleanConfig, runbookMarker } from "@runbook/config";
import { findDirectoryHoldingFileOrError } from "@runbook/files";
import path from "path";
import { isErrors } from "@runbook/utils";
import { defaultHandler, getHandler, startKoa } from "@runbook/api_koa";
import { executeScriptInShell, osType } from "@runbook/scripts";


function findReactDir ( cwd: string ) {
  const configDir = findDirectoryHoldingFileOrError ( cwd, runbookMarker )
  if ( isErrors ( configDir ) ) return configDir
  const reactDir = path.join ( configDir, runbookMarker, 'react' )
  return reactDir;
}
export function addGuiCommand ( cmd: Command, cleanConfig: CleanConfig, cwd: string ) {
  cmd.command ( 'gui' ).description ( 'starts the react gui' )
    .option ( '-p|--port <port>', 'port to run on', '3000' )
    .option ( '---directory', 'directory to run from - for development only' )
    .action ( async ( opts ) => {
      const reactDir = opts.directory ? opts.directory : findReactDir ( cwd );
      if ( isErrors ( reactDir ) ) return reactDir.errors.forEach ( e => console.log ( e ) )
      const port = Number.parseInt ( opts.port )
      await startKoa ( reactDir, port, defaultHandler (
        getHandler ( '/config', JSON.stringify ( cleanConfig ), 'application/json' ) ) )
      if ( osType () === 'Windows_NT' ) {
        executeScriptInShell ( cwd, `start http://localhost:${port}` )
      }
    } )


}