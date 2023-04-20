import { RunbookComponentWithProps, RunbookProps, RunbookState } from "@runbook/utilities_react";


export interface NavItemProps extends RunbookProps<string> {
  page: string
}


export const unselectedNavItem: RunbookComponentWithProps<string, NavItemProps> =
               st => ( { page }: NavItemProps ) =>
                 (<li onClick={e => st.set ( page )}> {page}</li>);


export const selectedNavItem = ( { page }: { page: string } ) =>
  (<li><b>{page}</b></li>);


export const navItem: RunbookComponentWithProps<string, NavItemProps> =
               st => ( { page, focusedOn }: NavItemProps ) =>
                 focusedOn === page
                   ? selectedNavItem ( { page } )
                   : unselectedNavItem ( st ) ( { page, focusedOn: st.get () } )

export interface NavigationProps extends RunbookProps<string> {
  views: string[]
}


export const navigation: RunbookComponentWithProps<string, NavigationProps> = <S extends any> ( st: RunbookState<S, string> ) => {
  const NavItem = navItem<S> ( st );
  return ( { focusedOn, views } ): JSX.Element => {
    return (<>
      <ul>{views.map ( ( page ) => navItem ( st ) ( { page, focusedOn } ) )} </ul>
    </>)
  };
};

