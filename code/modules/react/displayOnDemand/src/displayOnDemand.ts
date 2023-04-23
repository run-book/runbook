import { display, jsonMe, RunbookComponent } from "@runbook/runbook_state";
import { getOptional, parsePath } from "@runbook/optics";
import { DisplayFn } from "./displayFn";
import { safeArray } from "@runbook/utils";

export interface DisplayContext<S> {
  displayFn: DisplayFn<S>
}

/** This displays the component based on the information in display context and the arguments
 * Note that the mode o
 */
export function displayOnDemand<S> ( dc: DisplayContext<S>, parentPath: string[], item: string ): RunbookComponent<S, any> {
  return st => props => {
    console.log ( 'displayOnDemand', parentPath, item, props.mode )
    console.log ( 'displayOnDemand -st.optGet', st.optGet () )
    if ( item === undefined ) return jsonMe ( st )
    let pathOpt = parsePath ( [ ...safeArray ( parentPath ), item ] );
    const newSt = st.chainOpt ( pathOpt )
    console.log ( 'displayOnDemand -pathOpt', pathOpt )
    console.log ( 'data at end of path', getOptional ( pathOpt, st.optGet () ) )
    console.log ( 'displayOnDemand -st', newSt )
    console.log ( 'displayOnDemand - new props', newSt.optGet () )
    const id = props.id + '.' + item;
    const displayFn: RunbookComponent<S, any> | undefined = dc.displayFn ( parentPath, item, props.mode || 'view', newSt.optGet () );
    return typeof displayFn !== 'function' ? jsonMe ( st ) : display ( newSt, props, displayFn );
  };
}

