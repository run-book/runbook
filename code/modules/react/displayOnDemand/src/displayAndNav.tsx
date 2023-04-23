import { RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { NameAnd, RefAndData } from "@runbook/utils";
import { navigation, NavigationContext } from "./navigation";
import { DisplayContext, displayOnDemand } from "./displayOnDemand";
import { focusOnJustData, focusOnJustRef } from "@runbook/optics";
import { focusQuery } from "@runbook/optics";
import { getMode } from "./mode";


/** This is a map from the selection path to the mode for that path. */
export type RememberedMode = NameAnd<string>
export interface SelectionState {
  selection: string[]
  rememberedMode?: RememberedMode
}
export function displayAndNav<S extends any> ( nc: NavigationContext<S>, dc: DisplayContext<S> ): RunbookComponent<S, RefAndData<SelectionState, any>> {
  return ( st: RunbookState<S, RefAndData<SelectionState, any>> ) => props => {
    const { focusedOn } = props
    const { ref, data } = focusedOn ? focusedOn : { ref: { selection: [], rememberedMode: {} }, data: [] }
    const { selection, rememberedMode } = ref
    const path = selection ?? []
    const parentPath = path.slice ( 0, path.length - 1 )
    const item = path[ path.length - 1 ]

    let refOpt = focusOnJustRef ( st.opt );
    let selectionOpt = focusQuery ( refOpt, 'selection' );
    const stForNav: RunbookState<S, string[]> = st.withOpt ( selectionOpt )
    const stForDisplay = st.withOpt ( focusOnJustData ( st.opt ) )

    const mode = getMode ( ref )
    console.log ( 'rememberedMode', JSON.stringify ( rememberedMode ) )
    console.log ( 'selection', item )
    console.log ( 'parentPath', parentPath )
    console.log ( 'item', item )
    console.log ( 'mode', mode )
    return <div>
      <nav className='navbar navbar-expand-lg navbar-light bg-light'>     {navigation ( nc ) ( stForNav ) ( { focusedOn: stForNav.optGet (), parent: stForDisplay.optGet (), parentPath: [] } )}</nav>
      {displayOnDemand ( dc, parentPath, item ) ( stForDisplay ) ( { focusedOn: stForDisplay.optGet (), mode } )}
    </div>
  }
}