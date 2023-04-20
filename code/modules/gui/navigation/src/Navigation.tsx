import { RunbookComponent, RunbookComponentWithProps, RunbookProps, RunbookState } from "@runbook/utilities_react";
import { composeOptional, focusQuery, Optional } from "@runbook/optics";
import { mapObjToArray, NameAnd, safeArray, safeObject } from "@runbook/utils";


export interface NavItemProps extends RunbookProps<string> {
  name: string
}


export const unselectedNavItem: RunbookComponentWithProps<string, NavItemProps> =
               st => ( { name }: NavItemProps ) =>
                 (<li onClick={e => st.set ( name )}> {name}</li>);


export const selectedNavItem = ( { name }: { name: string } ) =>
  (<li><b>{name}</b></li>);


export const navItem: RunbookComponentWithProps<string, NavItemProps> =
               st => ( { name, focusedOn }: NavItemProps ) =>
                 focusedOn === name
                   ? selectedNavItem ( { name } )
                   : unselectedNavItem ( st ) ( { name, focusedOn: st.get () } )


export interface SelectedAndItems<T> {
  selected: string
  items: NameAnd<T>
}

export function navigation<T> ( navItem: RunbookComponentWithProps<string, NavItemProps> ): RunbookComponent<SelectedAndItems<T>> {
  return st => {
    return ( { focusedOn } ): JSX.Element => {
      const selected = focusedOn?.selected;
      const stSelected = st.focusQuery ( "selected" );
      return (<>
        <ul>{          mapObjToArray ( safeObject ( focusedOn?.items ), ( t, name ) =>
            navItem ( stSelected ) ( { focusedOn: selected, name } ) )} </ul></>)
    };
  }
}

