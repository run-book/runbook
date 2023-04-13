#!/usr/bin/env node

import { loadFileInDirectory } from "@runbook/files";
import { CleanConfig, configFileName, runbookMarker } from "@runbook/config";
import { makeProgram, processProgram } from "./src/cli";


export function findVersion () {
  let packageJsonFileName = "../../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}
function processCli ( cwd: string, config: CleanConfig, argV: string[] ) {
  const program = makeProgram ( cwd, config, findVersion () );
  return processProgram ( program, argV );
}

const config = loadFileInDirectory ( process.cwd (), 'loading runbook config', runbookMarker, configFileName );

processCli ( process.cwd (), config, process.argv )

