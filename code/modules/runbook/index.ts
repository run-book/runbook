#!/usr/bin/env node

import { cachedConfigFileName, CleanConfig, findRunbookDirectoryOrError, runbookConfigFile, validateConfig } from "@runbook/config";
import { makeProgram, processProgram } from "./src/cli";
import { mapErrors, parseJson, prune } from "@runbook/utils";
import fs from "fs";
import { GitOps } from "@runbook/git";


export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}
function processCli ( cwd: string, config: CleanConfig, cleanConfig: CleanConfig, argV: string[] ) {
  const program = makeProgram ( cwd, config, cleanConfig, findVersion () );
  return processProgram ( program, argV );
}


async function loadRunbookConfigFile ( dir: string ) {
  const file = runbookConfigFile ( dir )
  try {
    return await fs.promises.readFile ( file )
  } catch ( e: any ) {
    return {}
  }
}

const loadAnyGits = ( gitOps: GitOps ) => async ( urls: string[] ) => {
  return Promise.all ( urls.map ( gitOps.cloneIfDoesntExist ) )
};


function getConfig ( cwd: string ) {
  return mapErrors ( findRunbookDirectoryOrError ( cwd ), async dir => {
      return mapErrors ( parseJson ( await loadRunbookConfigFile ( dir ), parsedConfig  => {

        const parents = parsedConfig.parents
        if (parents !== undefined)
        return configFileContents;
      } ) )
    }
  )
}
const config = getConfig ( process.cwd () );
const cleanConfig = prune ( config, '__from' ) as CleanConfig
const errors = validateConfig () ( cachedConfigFileName ) ( cleanConfig );
if ( errors.length > 0 ) console.error ( "There were errors in the runbook config file. Use 'runbook config' to see the issues" )
processCli ( process.cwd (), config, cleanConfig, process.argv )


