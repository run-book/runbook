import { RunbookComponent, RunbookState } from "@runbook/utilities_react";
import { CommonInstrument } from "@runbook/instruments";
import { isSharedScriptInstrument, isVaryingScriptInstument, SharedScriptInstrument } from "@runbook/scriptinstruments";

export const sharedInstrument = <S extends any> ( st: RunbookState<S, SharedScriptInstrument> ) => () => {
  return <div>Shared Script Instrument</div>

}
export const varyingInstrument = <S extends any> ( st: RunbookState<S, SharedScriptInstrument> ) => () => {
  return <div>Varying Script Instrument</div>
}

export const JsonMe = ( st: RunbookState<any, any> ) => () => {
  return <pre>{JSON.stringify ( st.optGet (), null, 2 )}</pre>
}

export const instrument: RunbookComponent<CommonInstrument> = st => () => {
  const i = st.get ();
  if ( isSharedScriptInstrument ( i ) ) return sharedInstrument ( st as any ) ()
  if ( isVaryingScriptInstument ( i ) ) return varyingInstrument ( st as any ) ()
  return <div><p>Unknown Instrument</p>{JsonMe ( st ) ()}</div>
};
