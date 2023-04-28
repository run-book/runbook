import { RunbookComponent } from "@runbook/runbook_state";
import { RememberedMode, SelectionState } from "./navigation";
import { focusQuery, Optional } from "@runbook/optics";

export function changeMode<S> ( newMode: string ): RunbookComponent<S, SelectionState> {
  return st => ( { focusedOn } ) => {
    function onClick () {
      const selection = focusedOn?.selection || []
      const path = selection.join ( '.' )
      console.log ( 'onclick - selection', selection, '==>', path )
      const rememberOpt: Optional<S, RememberedMode> = focusQuery ( st.opt, 'rememberedMode' ) as any
      st.withOpt ( rememberOpt ).mapWithDefForFrom ( mode => ({ ...mode, [ path ]: newMode }), {} )
    }

    return <button onClick={onClick}>{newMode}</button>
  }
}