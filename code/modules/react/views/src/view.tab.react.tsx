import { displayWithNewOpt, RunbookComponent, RunbookProps, RunbookState } from "@runbook/runbook_state";
import { last, RefAndData, safeArray, safeObject, Tuple2 } from "@runbook/utils";
import { SelectionState } from "@runbook/menu_react";
import { View } from "@runbook/views";
import { runView } from "./view.run.react";
import { BindingContext } from "@runbook/bindings";
import { composeOptional, focusOnJustA, focusOnJustB, focusOnJustData, focusOnJustRef, focusQuery, Optional, optionalForRefAndData, optionalForTuple, parsePath } from "@runbook/optics";
import { displayView } from "./view.details.react";

export const optForViewTab = <S extends any> ( selectionStateOpt: Optional<S, SelectionState>, sitOpt: Optional<S, any> ) => ( rootOptional: Optional<S, any>, viewPath: string[] ): Optional<S, RefAndData<SelectionState, Tuple2<View, any>>> =>
  optionalForRefAndData ( selectionStateOpt, optionalForTuple ( composeOptional ( rootOptional, parsePath ( viewPath ) ), sitOpt ) );

function displaySelectedTab<S> ( st: RunbookState<S, RefAndData<SelectionState, Tuple2<View, any>>>, props: RunbookProps<RefAndData<SelectionState, Tuple2<View, any>>>,
                                 situationOpt: Optional<S, any>, bc: BindingContext ) {
  const { focusedOn } = props;
  const selection = focusedOn?.ref;
  const name = last ( safeArray ( selection?.displayPath ) )
  if ( props.mode === 'run' ) {
    const opt = optionalForTuple ( focusOnJustData ( st.opt ), situationOpt )
    return displayWithNewOpt ( st, props, focusOnJustData ( st.opt ), runView ( name, bc ) )
  } else
    return displayWithNewOpt ( st, props, focusOnJustA ( focusOnJustData ( st.opt ) ), displayView ( name ) )
}
export function displayViewTabs<S> ( bc: BindingContext ): RunbookComponent<S, RefAndData<SelectionState, Tuple2<View, any>>> {
  return ( st ) => ( props ) => {
    const ss = props.focusedOn?.ref
    const path = safeArray ( ss?.menuPath ).join ( '.' )
    const stForSelection = st.withOpt ( focusQuery ( focusOnJustRef ( st.opt ), 'rememberedMode' ) )
    const remMode = safeObject ( stForSelection.optGet () )
    const situationOpt = focusOnJustB ( (focusOnJustData ( st.opt )) )
    return <>
      <button onClick={() => stForSelection.set ( { ...remMode, [ path ]: 'view' } )}>View</button>
      <button onClick={() => stForSelection.set ( { ...remMode, [ path ]: 'run' } )}>Run</button>
      {displaySelectedTab ( st, props, situationOpt, bc )}
    </>
  }


}