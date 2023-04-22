import { jsonMe, RunbookComponent } from "@runbook/utilities_react";
import { parsePath } from "@runbook/optics";
import { DisplayFn } from "./displayFn";

export interface DisplayContext<S> {
  displayFn: DisplayFn<S>
}

/** This displays the component based on the information in display context and the arguments
 * Note that the mode o
 */
export function displayOnDemand<S> ( dc: DisplayContext<S>, parentPath: string[], item: string ): RunbookComponent<S, any> {
  return st => props => {
    const newSt = st.withOpt ( parsePath ( [ ...parentPath, item ] ) )
    const displayFn: RunbookComponent<S, any> | undefined = dc.displayFn ( parentPath, item, props.mode || 'view', newSt.optGet () );
    return typeof displayFn !== 'function' ? jsonMe ( st ) : displayFn ( newSt ) ( props );
  };
}

