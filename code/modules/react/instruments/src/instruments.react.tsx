import { jsonMe, RunbookComponent, RunbookState } from "@runbook/utilities_react";
import { CommonInstrument } from "@runbook/instruments";
import { isSharedScriptInstrument, isVaryingScriptInstument, ScriptInstrument, SharedScriptInstrument } from "@runbook/scriptinstruments";

export const sharedInstrument = <S extends any> ( st: RunbookState<S, SharedScriptInstrument> ) => () => {
  return <div>Shared Script Instrument</div>

}
export const varyingInstrument = <S extends any> ( st: RunbookState<S, SharedScriptInstrument> ) => () => {
  return <div>Varying Script Instrument</div>
}


export function scriptInstrument<S> (): RunbookComponent<S, ScriptInstrument> {
  return st => () => {
    const i = st.get ();
    if ( isSharedScriptInstrument ( i ) ) return sharedInstrument ( st as any ) ()
    if ( isVaryingScriptInstument ( i ) ) return varyingInstrument ( st as any ) ()
    return <div><p>Unknown Instrument</p>{jsonMe ( st )}</div>
  }
}
