import { Command } from "commander";
import { CleanConfig, runbookMarker } from "@runbook/config";
import { findDirectoryHoldingFileOrError } from "@runbook/files";
import path from "path";
import { isErrors, OS } from "@runbook/utils";
import { BodyHandlerResult, defaultHandler, getHandler, postHandler, startKoa } from "@runbook/koa";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { scriptExecutable, ScriptInstrument } from "@runbook/scriptinstruments";
import { jsonToDisplay } from "@runbook/displayformat";
import { executeScriptForCmd } from "./instrument.command";
import { execute, Execution, Executor } from "@runbook/executors";
import { executeEndpoint, executeStatusEndpoint } from "@runbook/koa_instrument";
import { Cache, makeCacheOptions } from "@runbook/cache";
import { Params } from "@runbook/loaders";

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


export function addGuiCommand ( os: OS, cmd: Command, cleanConfig: CleanConfig, cwd: string, executor: Executor ) {
  cmd.command ( 'gui' ).description ( 'starts the react gui' )
    .option ( '-p|--port <port>', 'port to run on', '3000' )
    .option ( '---directory', 'directory to run from - for development only' )
    .action ( async ( opts ) => {
      const reactDir = opts.directory ? opts.directory : findReactDir ( cwd );
      if ( isErrors ( reactDir ) ) return reactDir.errors.forEach ( e => console.log ( e ) )
      const port = Number.parseInt ( opts.port )
      const cacheOptions = makeCacheOptions ()
      const cache: Cache<Execution<[ string, any ]>> = {}
      const nameToInstrument: ( name: string ) => ScriptInstrument = name => cleanConfig.instrument[ name ]
      const executeFn = ( name: string, s: ScriptInstrument ) => ( params: Params ): Execution<[ string, ScriptInstrument ]> =>
        execute ( executor ) ( scriptExecutable ( os, 'api', opts.debug ), 10000, [ name, s ], params )
      await startKoa ( reactDir, port, defaultHandler (
        getHandler ( '/config', JSON.stringify ( cleanConfig ), 'application/json' ),
        // postHandler ( '/instrument', instrumentBodyHandler ( cwd, cleanConfig ) ),
        executeEndpoint ( '/execute', cacheOptions, nameToInstrument, cache, executeFn ),
        executeStatusEndpoint ( '/executeStatus', cache ) ) )


      if ( osType () === 'Windows_NT' ) {
        executeScriptInShell ( cwd, `start http://localhost:${port}` )
      }
    } )


}