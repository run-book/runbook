import { mapObjToArray, NameAnd, safeObject } from "@runbook/utils";
import { jsonMe, RunbookComponent, RunbookComponentWithProps, RunbookProps } from "@runbook/utilities_react";

export type DemoType = NameAnd<NameAnd<NameAnd<string>>>


export const views: RunbookComponent<NameAnd<string>> = st => na =>
  <><h1>Views:</h1>{jsonMe ( st )}</>

export const instruments: RunbookComponent<NameAnd<string>> = st => na =>
  <><h1>Instruments:</h1>{jsonMe ( st )}</>
export const three: RunbookComponent<NameAnd<string>> = st => na =>
  <><h1>Three:</h1>{jsonMe ( st )}</>

export const demoFns: NameAnd<RunbookComponent<NameAnd<string>>> = {
  views,
  instruments,
  three
}


export const demo: RunbookComponent<DemoType> = st => ( { focusedOn } ) =>
  (<>{mapObjToArray ( safeObject ( focusedOn ), ( v, k ) => {
    const fn = demoFns[ k ]
    const stK = st.focusQuery ( k )
    if ( fn ) return mapObjToArray ( v, ( data, name ) => fn ( stK.focusQuery ( name ) ) ( data ) )
    else return <><p>Unknown</p>{jsonMe ( stK )}</>
  } )}</>)

export interface DisplaySomethingProps extends RunbookProps<NameAnd<any>> {
  name: string
}
export function displaySomething ( displayFns: NameAnd<RunbookComponent<any>> ): RunbookComponentWithProps<NameAnd<any>, DisplaySomethingProps> {
  return st => ( { name, focusedOn } ) => {
    const fn: RunbookComponent<any> | undefined = displayFns[ name ]
    const stk = st.focusQuery ( name )
    const dispFn: RunbookComponent<any> = fn !== undefined ? fn : st => () => <><p>Unknown</p>{jsonMe ( stk )}</>
    return dispFn ( stk ) ( stk.get () )
  }
}
