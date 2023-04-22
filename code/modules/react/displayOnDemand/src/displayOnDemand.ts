import { display, jsonMe, RunbookComponent } from "@runbook/utilities_react";
import { composeOptional, getOptional, Optional, parsePath } from "@runbook/optics";
import { DisplayFn } from "./displayFn";

export interface DisplayContext<S> {

  displayFn: DisplayFn<S>
}

/** This displays the component based on the information in display context and the arguments
 * Note that the mode o
 */
export function displayOnDemand<S> ( dc: DisplayContext<S>, parentPath: string[], item: string ): RunbookComponent<S, any> {
  return st => props => {
    let pathOpt = parsePath ( [ ...parentPath, item ] );
    const newSt = st.chainOpt ( pathOpt )
    console.log ( 'displayOnDemand', parentPath, item, props.mode )
    console.log ( 'displayOnDemand -st.optGet', st.optGet () )
    console.log ( 'displayOnDemand -pathOpt',pathOpt )
    console.log ( 'data at end of path', getOptional ( pathOpt, st.optGet () ) )
    console.log ( 'displayOnDemand -st', newSt )
    console.log ( 'displayOnDemand - new props', newSt.optGet () )
    const displayFn: RunbookComponent<S, any> | undefined = dc.displayFn ( parentPath, item, props.mode || 'view', newSt.optGet () );
    return typeof displayFn !== 'function' ? jsonMe ( st ) : display ( displayFn, newSt );
  };
}

