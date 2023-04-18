import { Command } from "commander";
import { startShell } from "@runbook/scripts";
import { toArray } from "@runbook/utils";
import * as path from "path";
import { findDirectoryHoldingFileOrThrow } from "@runbook/files";


export function addEditViewOptions ( thing: string, c: Command ) {
  return c
    .option ( "-e|--edit", `Open an editor for the ${thing}` )
    .option ( "-v|--view", `Display the json for the ${thing}` )
}

export async function executeAndEditViewAndExit ( cwd: string, args: any, inConfig: any, inCleanConfig: any ) {
  if ( args.edit ) {
    if ( inCleanConfig === undefined ) throw Error ( `Software error inCleanConfig is undefined` )
    if ( inConfig === undefined ) throw Error ( `Software error inConfig is undefined` )
    if ( inConfig.__from === undefined ) {
      console.log ( `Cannot edit this. It doesn't have a __from property` )
      process.exit ( 2 )
    }
    const dir = findDirectoryHoldingFileOrThrow ( cwd, '.runbook' ) + '/.runbook'
    console.log ( `Starting shell for ${inConfig.__from} in ${dir}` )

    await Promise.all ( toArray ( inConfig.__from ).map ( async ( from: string ) => startShell ( dir, from ) ) )
    process.exit ( 0 )
  }
  if ( args.view ) {
    console.log ( JSON.stringify ( inCleanConfig, null, 2 ) )
    process.exit ( 0 )
  }
}