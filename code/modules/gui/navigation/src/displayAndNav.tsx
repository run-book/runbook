import { RunbookComponent, RunbookState } from "@runbook/utilities_react";
import { NameAnd, RefAndData } from "@runbook/utils";
import { navigation, NavigationContext } from "./navigation";
import { DisplayContext, displayOnDemand } from "./displayOnDemand";
import { focusOnJustData, focusOnJustRef, focusRefOn } from "@runbook/optics/dist/src/refAndData.optics";
import { focusQuery, getOptional } from "@runbook/optics";


/** This is a map from the selection path to the mode for that path. */
export type RememberedMode = NameAnd<string>
export interface DisplayAndNavReference {
  selection: string[]
  rememberedMode?: RememberedMode
}
export function displayAndNav<S extends any> ( nc: NavigationContext<S>, dc: DisplayContext<S> ): RunbookComponent<S, RefAndData<DisplayAndNavReference, any>> {
  return ( st: RunbookState<S, RefAndData<DisplayAndNavReference, any>> ) => props => {
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


    console.log ( 'rememberedMode', JSON.stringify ( rememberedMode ) )
    console.log ( 'selection', item )
    console.log ( 'parentPath', parentPath )
    console.log ( 'item', item )
    return <div>
      {navigation ( nc ) ( stForNav ) ( { focusedOn: stForNav.optGet (), parent: stForDisplay.optGet (), parentPath: [] } )}
      {displayOnDemand ( dc, parentPath, item, 'notIMplmentedYet' ) ( stForDisplay ) ( { focusedOn: stForDisplay.optGet () } )}
    </div>
  }
}