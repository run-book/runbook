import { RunbookComponent, RunbookComponentWithProps, RunbookProps, RunbookState } from "@runbook/utilities_react";
import { composeOptional, focusQuery } from "@runbook/optics";
import { safeArray } from "@runbook/utils";


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


export interface SelectedPageAndViews {
  selectedPage: string
  views: string[]
}

export const navigation: RunbookComponent<SelectedPageAndViews> = st => {
  const NavItem = navItem ( st.focusQuery ( 'selectedPage' ) );
  return ( { focusedOn } ): JSX.Element => {
    const selectedPage = focusedOn?.selectedPage;
    return (<>
      <ul>{safeArray ( focusedOn?.views ).map ( ( page ) => <NavItem page={page} focusedOn={selectedPage}/> )} </ul>
    </>)
  };
};

