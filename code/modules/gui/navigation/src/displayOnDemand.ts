import { jsonMe, RunbookComponent } from "@runbook/utilities_react";
import { parsePath } from "@runbook/optics";
import { DisplayFn } from "./displayFn";

export interface DisplayContext<S> {
  displayFn: DisplayFn<S>
}
export const displayOnDemand = <S> ( dc: DisplayContext<S>, parentPath: string[], item: string ): RunbookComponent<S,any> =>
  st => props => {
    const newSt = st.withOpt ( parsePath ( [ ...parentPath, item ] ) )
    const displayFn: RunbookComponent<S,any> | undefined = dc.displayFn ( parentPath, item, newSt.optGet () );
    console.log('displayOnDemand - displayFn', displayFn  )

    return typeof displayFn !== 'function' ? jsonMe ( st ) : displayFn ( newSt ) ( props );
  }