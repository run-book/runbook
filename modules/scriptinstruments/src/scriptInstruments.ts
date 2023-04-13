import { CommonInstrument, ExecuteInstrumentK } from "@runbook/instruments";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { execute } from "@runbook/scripts";
import { DisplayFormat, stringToJson } from "@runbook/displayformat";

export interface SharedScriptInstrument extends CommonScript {
  script: string
  outputColumns?: string[],
}
export function isSharedScriptInstrument ( instrument: CommonInstrument ): instrument is SharedScriptInstrument {
  return (instrument as SharedScriptInstrument).script !== undefined
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
  key: string
  format: DisplayFormat
}

interface ExecuteScriptOptions {
  cwd: string,
  showCmd?: boolean
}
export interface ExecuteOptions {
  instrument: ScriptInstrument,
  cwd: string
  showCmd?: boolean
  raw?: boolean
}

export const executeSharedScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<SharedScriptInstrument> => ( context: string, si: SharedScriptInstrument ) => async ( params ) => {
  const cmd = derefence ( context, params, si.script, { variableDefn: bracesVarDefn } );
  const { cwd, showCmd, raw } = opt
  if ( showCmd ) return cmd
  let res = await execute ( cwd, cmd );
  let lines = res.split ( '\n' );
  return stringToJson ( lines, raw ? "raw" : si.format )
}
export function findShared ( s: ScriptInstrument ): SharedScriptInstrument {
  if ( isVaryingScriptInstument ( s ) ) return s.windows
  else if ( isSharedScriptInstrument ( s ) ) return s
  else throw new Error ( `Unknown instrument type${s}` )
}

export const executeScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<ScriptInstrument> =>
  ( context, instrument ) => async ( params ) =>
    executeSharedScriptInstrument ( opt ) ( context, findShared ( instrument ) ) ( params )
