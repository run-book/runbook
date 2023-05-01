import { Command } from "commander";
import { CleanConfig, runbookMarker } from "@runbook/config";
import { findDirectoryHoldingFileOrError } from "@runbook/files";
import path from "path";
import { isErrors } from "@runbook/utils";
import { BodyHandlerResult, defaultHandler, getHandler, postHandler, startKoa } from "@runbook/api_koa";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { optionToDisplayFormat } from "./display";
import { jsonToDisplay } from "@runbook/displayformat";
import { executeScriptForCmd } from "./instrument.command";


function findReactDir ( cwd: string ) {
  const configDir = findDirectoryHoldingFileOrError ( cwd, runbookMarker )
  if ( isErrors ( configDir ) ) return configDir
  const reactDir = path.join ( configDir, runbookMarker, 'react' )
  return reactDir;
}

async function executeInstrumentedScript ( args: any, cwd: string, instrument: ScriptInstrument ) {
  let json = await executeScriptForCmd ( instrument, args, cwd );
  const displayFormat = 'json'
  return jsonToDisplay ( json, displayFormat )
}

const instrumentBodyHandler = ( cwd: string, config: CleanConfig ) => async ( body: string ): Promise<BodyHandlerResult> => {
  console.log ( 'body', body )
  return ({
    status: 200,
    body: `{"hello":"world"}`,
    contentType: 'application/json'
  });
};


export function addGuiCommand ( cmd: Command, cleanConfig: CleanConfig, cwd: string ) {
  cmd.command ( 'gui' ).description ( 'starts the react gui' )
    .option ( '-p|--port <port>', 'port to run on', '3000' )
    .option ( '---directory', 'directory to run from - for development only' )
    .action ( async ( opts ) => {
      const reactDir = opts.directory ? opts.directory : findReactDir ( cwd );
      if ( isErrors ( reactDir ) ) return reactDir.errors.forEach ( e => console.log ( e ) )
      const port = Number.parseInt ( opts.port )
      await startKoa ( reactDir, port, defaultHandler (
        getHandler ( '/config', JSON.stringify ( cleanConfig ), 'application/json' ),
        postHandler ( '/instrument', instrumentBodyHandler ( cwd, cleanConfig ) ) ) )

      if ( osType () === 'Windows_NT' ) {
        executeScriptInShell ( cwd, `start http://localhost:${port}` )
      }
    } )


}