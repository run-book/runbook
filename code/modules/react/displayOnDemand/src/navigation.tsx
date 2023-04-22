import { isPrimitive, mapObjToArray, NameAnd } from "@runbook/utils";
import { jsonMe, RunbookComponentWithProps, RunbookProps } from "@runbook/runbook_state";


export interface NavigationContext<S> {
  /** Later this will be more complex and store the history of where we have been */
  // selectionOpt: Optional<S, string[]>
  /** The names control the order in which things are displayed. The Runbook component is used to actually display the component */
  displayInNav: <T> ( path: string[], name: string, t: T ) => boolean

}

export interface NavItemWithProps extends NavWithProps {
  item: string
}
export interface NavWithProps extends RunbookProps<string[]> {
  parentPath: string[]
  parent: NameAnd<any>
}
export const unselectedNavItem: RunbookComponentWithProps<string[], NavItemWithProps> = st => ( { item, parentPath } ) =>
  <li onClick={() => st.set ( [ ...parentPath, item ] )}>{item}</li>

/** The selected NavItem needs to know the selected item and the current point in the object being displayed */
export const selectedNavItem = <S extends any> ( nc: NavigationContext<S> ): RunbookComponentWithProps<string[], NavItemWithProps> =>
  st => ( props ) => {
    const { item, parentPath, parent } = props
    const { displayInNav } = nc
    const newParent = parent[ item ]
    const shouldDisplayChild = displayInNav ( parentPath, item, parent ) && newParent !== undefined && !isPrimitive ( newParent )
    if ( shouldDisplayChild )
      return <li><b onClick={() => st.set ( [ ...parentPath, item ] )}>{item}</b>
        {navigation ( nc ) ( st ) ( { ...props, parentPath: [ ...parentPath, item ], parent: newParent } )}
      </li>
    else { return <li><b>{item}</b></li> }
  };

/** There is an optimisation here... the parentPath is assumed to be selected */
function isSelected ( selectedPath: string[] | undefined, parentParentLength: number, item: string ) {
  console.log ( "isSelected", selectedPath, parentParentLength, item, selectedPath?.[ parentParentLength ] === item )
  return selectedPath?.[ parentParentLength ] === item
}
export const navItem = <S extends any> ( navContext: NavigationContext<S> ): RunbookComponentWithProps<string    [ ], NavItemWithProps> =>
  set => ( props ) => {
    const { focusedOn, item, parentPath } = props
    return isSelected ( focusedOn, parentPath.length, item )
      ? selectedNavItem ( navContext ) ( set ) ( props )
      : unselectedNavItem ( set ) ( props );
  }

export function navigation<S> ( nc: NavigationContext<S> ): RunbookComponentWithProps<string  [ ], NavWithProps> {
  return st => ( props ) => {
    const { focusedOn, parentPath, parent } = props
    if ( isPrimitive ( parent ) ) return <div>Primitive {parent}</div>
    if ( Array.isArray ( parent ) ) return <div>Array{jsonMe ( st )}</div>
    return <ul>{mapObjToArray ( parent, ( v, item ) =>
      <li key={item}>{navItem ( nc ) ( st ) ( { ...props, item } )}</li> )}
    </ul>
  }

}