import { RunbookComponent, RunbookState } from "@runbook/utilities_react";
import { RefAndData } from "@runbook/utils";
import { navigation, NavigationContext } from "./navigation";
import { DisplayContext, displayOnDemand } from "./displayOnDemand";
import { focusOnJustData, focusOnJustRef } from "@runbook/optics/dist/src/refAndData.optics";

export function displayAndNav<S extends any> ( nc: NavigationContext<S>, dc: DisplayContext<S> ): RunbookComponent<S, RefAndData<string[], any>> {
  return ( st: RunbookState<S, RefAndData<string[], any>> ) => props => {
    const { focusedOn } = props
    const path = focusedOn?.ref ?? []
    const parentPath = path.slice ( 0, path.length - 1 )
    const item = path[ path.length - 1 ]

    const stForNav = st.withOpt ( focusOnJustRef ( st.opt ) )
    const stForDisplay = st.withOpt ( focusOnJustData ( st.opt ) )
    console.log('parentPath', parentPath)
    console.log('item', item)
    return <div>
      {navigation ( nc ) ( stForNav ) ( { focusedOn: stForNav.optGet (), parent: focusedOn?.data, parentPath:[] } )}
      {displayOnDemand ( dc, parentPath, item ) ( stForDisplay ) ( { focusedOn: stForDisplay.optGet () } )}
    </div>
  }
}