import { CommonInstrument, ExecuteInstrumentK } from "@runbook/instruments";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { ExecuteScriptFn, ExecuteScriptLinesFn } from "@runbook/scripts";
import { DisplayFormat, stringToJson } from "@runbook/displayformat";
import { mapObjToArray, OS, toArray } from "@runbook/utils";

export interface SharedScriptInstrument extends CommonScript {
  script: string | string[]
  outputColumns?: string[],
}
export function isSharedScriptInstrument ( instrument: CommonInstrument ): instrument is SharedScriptInstrument {
  return (instrument as any).script !== undefined
}
export interface VaryingScriptInstrument extends CommonScript {
  windows: SharedScriptInstrument,
  linux: SharedScriptInstrument,
}
export function isVaryingScriptInstument ( instrument: CommonInstrument ): instrument is VaryingScriptInstrument {
  return (instrument as any).windows !== undefined
}
export type ScriptInstrument = VaryingScriptInstrument | SharedScriptInstrument
export function isScript ( instrument: CommonInstrument ): instrument is ScriptInstrument {
  return isSharedScriptInstrument ( instrument ) || isVaryingScriptInstument ( instrument )
}
export interface CommonScript extends CommonInstrument {
  type: 'script'
  format: DisplayFormat
}

export interface ExecuteOptions {
  os: OS
  executeScript: ExecuteScriptFn,
  executeScripts: ExecuteScriptLinesFn,
  instrument: ScriptInstrument,
  cwd: string
  showCmd?: boolean
  raw?: boolean
}

export const executeSharedScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<SharedScriptInstrument> => ( context: string, si: SharedScriptInstrument ) => async ( params ) => {
  if ( si === undefined ) throw new Error ( `Instrument is undefined` )
  const allArgs = mapObjToArray ( params, p => p ).join ( ' ' )
  const argsNames = mapObjToArray ( params, ( p, n ) => n ).join ( ' ' )

  let dic = { params, allArgs, argsNames };
  const cmds = toArray ( si.script ).map ( script => derefence ( context, dic, script, { variableDefn: bracesVarDefn } ) );
  const { cwd, showCmd, raw } = opt
  if ( showCmd ) return cmds.join ( '\n' )
  let res = await opt.executeScripts ( cwd, cmds);
  let lines = res.split ( '\n' ).filter ( l => l.length > 0 );
  let dispOpt: DisplayFormat = raw ? "raw" : si.format ? si.format : { type: "table" };
  return stringToJson ( lines, dispOpt )
}
export function findShared ( os: OS, s: ScriptInstrument ): SharedScriptInstrument {
  function check ( s: SharedScriptInstrument ) {
    if ( s?.script === undefined ) throw new Error ( `OS is ${os}. No script for instrument ${s}` )
    return s
  }
  if ( isSharedScriptInstrument ( s ) ) return check ( s )
  else if ( isVaryingScriptInstument ( s ) ) {
    if ( os === 'Windows_NT' ) if ( s.windows ) return check ( s.windows ); else throw new Error ( `No windows script for instrument ${s}` )
    if ( os === 'Linux' ) if ( s.linux ) return check ( s.linux ); else throw new Error ( `No linux script for instrument ${s}` )
    if ( os === 'Darwin' ) if ( s.linux ) return check ( s.linux ); else throw new Error ( `No linux script for instrument ${s}` )
  } else throw new Error ( `OS is ${os}. Cannot execute instrument type${s}` )
}

export const executeScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<ScriptInstrument> =>
  ( context, instrument ) => {
    let sharedScriptInstrument = findShared ( opt.os, instrument );
    if ( sharedScriptInstrument === undefined ) throw new Error ( `Instrument is undefined. OS ${opt.os}. Raw was ${JSON.stringify ( instrument, null, 2 )}` )
    return async ( params ) =>
      executeSharedScriptInstrument ( opt ) ( context, sharedScriptInstrument ) ( params );
  }
