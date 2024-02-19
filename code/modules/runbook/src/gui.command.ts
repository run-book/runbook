import { Command } from "commander";
import { CleanConfig, runbookMarker } from "@runbook/config";
import { findDirectoryHoldingFileOrError } from "@runbook/files";
import path from "path";
import { isErrors, OS } from "@runbook/utils";
import { defaultHandler, getHandler, startKoa } from "@runbook/koa";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { scriptExecutable, ScriptInstrument } from "@runbook/scriptinstruments";
import { execute, Execution, Executor } from "@runbook/executors";
import { executeEndpoint, executeStatusEndpoint } from "@runbook/koa_instrument";
import { Cache, makeCacheOptions } from "@runbook/cache";
import { Params } from "@runbook/loaders";
import { addDebug } from "./debug";

function findReactDir ( cwd: string ) {
  const configDir = findDirectoryHoldingFileOrError ( cwd, runbookMarker )
  if ( isErrors ( configDir ) ) return configDir
  const reactDir = path.join ( configDir, runbookMarker, 'react' )
  return reactDir;
}


export function addGuiCommand ( os: OS, cmd: Command, cleanConfig: CleanConfig, cwd: string, executor: Executor ) {
  cmd.command ( 'gui' ).description ( 'starts the react gui' )
    .option ( '-p|--port <port>', 'port to run on', '3001' )
    .option ( '--directory', 'directory to run from - for development only' )
    .option ( '-d, --debug', 'some debugging on the api' )
    .action ( async ( opts ) => {
      addDebug ( opts.debug )
      const reactDir = opts.directory ? opts.directory : findReactDir ( cwd );
      if ( isErrors ( reactDir ) ) return reactDir.errors.forEach ( e => console.log ( e ) )
      const port = Number.parseInt ( opts.port )
      const debug = opts.debug === true
      const cacheOptions = makeCacheOptions ()
      const cache: Cache<Execution<[ string, any ]>> = {}
      const nameToInstrument: ( name: string ) => ScriptInstrument = name => cleanConfig.instrument[ name ]
      const executeFn = ( name: string, s: ScriptInstrument ) => ( params: Params ): Execution<[ string, ScriptInstrument ]> =>
        execute ( executor ) ( scriptExecutable ( os, 'api', opts.debug ), 10000, [ name, s ], params )
      await startKoa ( reactDir, port, debug, defaultHandler (
        getHandler ( '/config', JSON.stringify ( cleanConfig ), 'application/json' ),
        // postHandler ( '/instrument', instrumentBodyHandler ( cwd, cleanConfig ) ),
        executeEndpoint ( '/execute', cacheOptions, nameToInstrument, cache, executeFn ),
        executeStatusEndpoint ( '/executeStatus', cache ) ) )


      if ( osType () === 'Windows_NT' ) {
        executeScriptInShell ( cwd, `start http://localhost:${port}` )
      }
    } )


}