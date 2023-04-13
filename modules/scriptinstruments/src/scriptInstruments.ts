import { CommonInstrument } from "@runbook/instruments";

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
  ignoreRows?: number,
  inputColumns?: string[],
}

