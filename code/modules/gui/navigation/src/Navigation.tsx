import { HasSelectedPage } from "./SelectedPage";
import { RunbookState } from "@runbook/utilities_react";


export interface NavItemProps {
  page: string
}


export const unselectedNavItem = <S extends HasSelectedPage> ( st: RunbookState<S, string> ) =>
  ( { page }: NavItemProps ) =>
    (<li key={page} onClick={e => st.set ( page )}> {page}</li>);


export const selectedNavItem = <S extends HasSelectedPage> ( st: RunbookState<S, string> ) =>
  ( { page }: NavItemProps ) =>
    (<li key={page}><b>{page}</b></li>);


export const navItem = <S extends HasSelectedPage> ( st: RunbookState<S, string> ) =>
  ( { page }: NavItemProps ) => st.get () === page
    ? selectedNavItem ( st ) ( { page } )
    : unselectedNavItem ( st ) ( { page } )

export interface NavigationProps {
  views: string[]
  page: string
}


export const navigation = <S extends HasSelectedPage> ( st: RunbookState<S, string> ) => {
  const NavItem = navItem<S> ( st );
  return ( { views }: NavigationProps ): JSX.Element => {
    return (<>
      <ul>{views.map ( ( view ) => <NavItem page={view}/> )} </ul>
    </>)
  };
};

