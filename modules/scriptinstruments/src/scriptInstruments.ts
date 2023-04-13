import { CommonInstrument, ExecuteInstrumentK } from "@runbook/instruments";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { execute } from "@runbook/scripts";

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
  return (instrument as VaryingScriptInstrument).windows !== undefined
}
export type ScriptInstrument = VaryingScriptInstrument | SharedScriptInstrument
export function isScript ( instrument: CommonInstrument ): instrument is ScriptInstrument {
  return isSharedScriptInstrument ( instrument ) || isVaryingScriptInstument ( instrument )
}
export interface CommonScript extends CommonInstrument {
  type: 'script'
  key: string
  ignoreHeaderRows?: number,
  ignoreTailRows?: number,
  inputColumns?: string[],
}

export const executeVaryingScriptInstrument = ( cwd: string, showCmd: boolean | undefined ): ExecuteInstrumentK<VaryingScriptInstrument> =>
  ( context: string, si: VaryingScriptInstrument ) => async ( params ) =>
    executeSharedScriptInstrument ( cwd, showCmd ) ( context, si.windows ) ( params )
export const executeSharedScriptInstrument = ( cwd: string, showCmd: boolean | undefined ): ExecuteInstrumentK<SharedScriptInstrument> => ( context: string, si: SharedScriptInstrument ) => async ( params ) => {
  const cmd = derefence ( context, params, si.script, { variableDefn: bracesVarDefn } );
  if ( showCmd ) return cmd
  let result =await execute ( cwd, cmd );
  return result;
}
export const executeScriptInstrument = ( cwd: string, showCmd: boolean | undefined ): ExecuteInstrumentK<ScriptInstrument> =>
  ( context, instrument ) => async ( params ) => {
    if ( isVaryingScriptInstument ( instrument ) )
      return executeVaryingScriptInstrument ( cwd, showCmd ) ( context, instrument ) ( params )
    else if ( isSharedScriptInstrument ( instrument ) )
      return executeSharedScriptInstrument ( cwd, showCmd ) ( context, instrument ) ( params )
    else throw new Error ( `Unknown instrument type${instrument}` )
  }
