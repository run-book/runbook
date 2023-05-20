#!/usr/bin/env node

import { loadFileInDirectory } from "@runbook/files";
import { cachedConfigFile, cachedConfigFileName, CleanConfig, runbookMarker, validateConfig } from "@runbook/config";
import { makeProgram, processProgram } from "./src/cli";
import { prune } from "@runbook/utils";
import { Executor, makeExecutor } from "@runbook/executors";


export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}
function processCli ( cwd: string, config: CleanConfig, cleanConfig: CleanConfig, executor: Executor, argV: string[] ) {
  const program = makeProgram ( cwd, config, cleanConfig, executor, findVersion () );
  return processProgram ( program, argV );
}

// const config = loadFileInDirectory ( process.cwd (), 'loading runbook config', runbookMarker, configFileName );

const config = loadFileInDirectory ( process.cwd (), 'loading runbook config', runbookMarker, cachedConfigFile );
const cleanConfig = prune ( config, '__from' ) as CleanConfig
const errors = validateConfig () ( cachedConfigFileName ) ( cleanConfig );
if ( errors.length > 0 ) console.error ( "There were errors in the runbook config file. Use 'runbook config issues' to see the issues" )
const executor = makeExecutor ()

processCli ( process.cwd (), config, cleanConfig, executor, process.argv )



