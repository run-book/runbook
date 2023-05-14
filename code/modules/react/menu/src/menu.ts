import { findFromPath, getDescription, mapObjToArray, NameAnd, RefAndData, safeObject } from "@runbook/utils";
import { display, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { focusOnJustData, focusOnJustRef, parsePath } from "@runbook/optics";
import { CleanConfig } from "@runbook/config";


export type RememberedMode = NameAnd<string>
export interface SelectionState {
  menuPath: string[]
  displayPath?: string[]
  selection?: string[]
  rememberedMode?: RememberedMode
  showDropdowns?: boolean
}


export type MenuFn<R> = ( menuPath: string[], path: string[] | undefined, name: string, children?: R[] ) => R

export interface MenuDefnFns<R> {
  navBar: MenuFn<R>
  navBarItem: MenuFn<R>,
  dropdownItem: MenuFn<R>,
}

export interface MenuAndDisplayFn<MenuR, DisplayR> extends MenuDefnFns<MenuR> {
  displayNothing: DisplayR,
  defaultDisplay: ( path: string [] ) => DisplayR,
}
export type CombinedMenuAndDisplayFn = ( menu: JSX.Element, display: JSX.Element ) => JSX.Element

export type MenuAndDisplayFnsForRunbook<S, Config> = MenuAndDisplayFn<RunbookComponent<S, SelectionState>, RunbookComponent<S, any>>
export type MenuDefnForRunbook<S> = MenuDefn<RunbookComponent<S, SelectionState>>

export type MenuDefnType = keyof MenuDefnFns<any>
export interface CommonMenuDefn<R> {
  type: MenuDefnType
  display?: ( path: string[] ) => R
}

interface FromDefn<R> {
  path: string[],
  display: ( path: string[] ) => R,
  type: MenuDefnType
}
export interface FromNameAndDataMenuDefn<R> extends CommonMenuDefn<R> {
  from: FromDefn<R>,
}
export function isFromNameAndDataMenuDefn<R> ( menuDefnItem?: MenuDefnItem<R> ): menuDefnItem is FromNameAndDataMenuDefn<R> {
  return (menuDefnItem as FromNameAndDataMenuDefn<R>)?.from !== undefined
}
export interface FromSingleDataMenuDefn<R> extends CommonMenuDefn<R> {
  path: string[]
}
export function isFromSingleDataMenuDefn<R> ( menuDefnItem: MenuDefnItem<R> | undefined ): menuDefnItem is FromSingleDataMenuDefn<R> {
  return (menuDefnItem as FromSingleDataMenuDefn<R>)?.path !== undefined && !isFromNameAndDataMenuDefn ( menuDefnItem )
}

export interface StaticMenuDefn<R> extends CommonMenuDefn <R> {
  children: MenuDefn<R>
}
export function isStaticMenuDefn<R> ( menuDefnItem: MenuDefnItem<R> | undefined ): menuDefnItem is StaticMenuDefn<R> {
  return (menuDefnItem as StaticMenuDefn<R>)?.children !== undefined
}

export type MenuDefnItem<R> = FromNameAndDataMenuDefn<R> | StaticMenuDefn<R> | FromSingleDataMenuDefn<R>
export type MenuDefn<R> = NameAnd<MenuDefnItem<R>>

function findChildren<S, R> ( menuPath: string[], fns: MenuDefnFns<R>, config: any, m: MenuDefnItem<R> ): any[] {
  if ( isStaticMenuDefn ( m ) ) return mapObjToArray ( safeObject ( m.children ), applyMenuItem ( menuPath, fns, config ) )
  if ( isFromNameAndDataMenuDefn ( m ) ) {
    const fn: MenuFn<R> = fns[ m.from.type ]
    const configPath = m.from.path;
    const obj = findFromPath ( config, configPath )
    if ( typeof obj === 'object' ) return Object.keys ( safeObject ( obj ) ).map ( k =>
      fn ( makeNewPath ( menuPath, k ), makeNewPath ( configPath, k ), k, [] ) )
    throw Error ( `Data at end of path [${menuPath.join ( '.' )}] was not an object. It was ${typeof obj}\n${JSON.stringify ( config )}` )
  }
  if ( isFromSingleDataMenuDefn ( m ) ) return []
  throw new Error ( 'Unknown menu defn type ' + JSON.stringify ( m ) )
}
function makeNewPath ( path: string[] | undefined, name: string ) {
  if ( path === undefined ) return [ name ]
  return [ ...path, name ];
}
const applyMenuItem = <S, R> ( menuPath: string[], fns: MenuDefnFns<R>, config: any ) => ( m: MenuDefnItem<R>, name: string ) => {
  try {
    let newMenuPath = makeNewPath ( menuPath, name );
    return fns[ m.type ] ( newMenuPath, (m as any).path, name, findChildren ( newMenuPath, fns, config, m ) );
  } catch ( e: any ) {
    console.error ( `Error applying menu item ${JSON.stringify ( m )} at path [${menuPath.join ( '.' )}]`, e )
    throw e
  }
}
function findInMd<R> ( m: MenuDefn<R>, path: string[] ): MenuDefnItem<R> | undefined {
  const [ name, ...rest ] = path
  const item = m[ name ]
  if ( rest.length === 0 ) return item
  if ( isStaticMenuDefn ( item ) ) return findInMd ( item.children, rest )
  return undefined
}

export const applyMenuDefn = <R, Config> ( prefix: string, fns: MenuDefnFns<R>, mdFn: ( cleanConfig: Config ) => MenuDefn<R>, config: Config ): R =>
  applyMenuItem ( [], fns, config ) ( { type: 'navBar', children: mdFn ( config ) }, prefix )

export const findDisplay = <S, Config> ( fns: MenuAndDisplayFnsForRunbook<S, Config>, mdFn: ( cleanConfig: Config ) => MenuDefnForRunbook<S> ): RunbookComponent<S, RefAndData<SelectionState, Config>> => {
  return rs => ( props ) => {
    const rsForConfig: RunbookState<S, any> = rs.withOpt ( focusOnJustData ( rs.opt ) )
    const { focusedOn } = props
    let selectionState = focusedOn?.ref;
    const config: Config | undefined = focusedOn?.data
    if ( config === undefined ) throw Error ( `No config in ${JSON.stringify ( focusedOn )}` )

    if ( !focusedOn ) return display ( rsForConfig, props, fns.displayNothing )
    const displayPath = selectionState?.displayPath
    const path = selectionState?.selection
    if ( displayPath && path ) {
      let menuDefn = mdFn ( config );
      const found: MenuDefnItem<RunbookComponent<S, any>> | undefined = findInMd ( menuDefn, displayPath )
      if ( !found ) {
        let parentPath = displayPath.slice ( 0, -1 );
        const parentFound: MenuDefnItem<RunbookComponent<S, any>> | undefined = findInMd ( menuDefn, parentPath )
        console.log ( 'parentPath/found', parentPath, parentFound, isFromNameAndDataMenuDefn ( parentFound ) )
        if ( parentFound && isFromNameAndDataMenuDefn ( parentFound ) ) {
          let lastPath: string = displayPath?.[ displayPath?.length - 1 ];
          const rsForPath: RunbookState<S, any> = rsForConfig.chainOpt ( parsePath ( [ ...parentFound.from.path, lastPath ] ) )
          console.log ( 'isFromNameAndDataMenuDefn/rsForPath', rsForPath )
          console.log ( 'isFromNameAndDataMenuDefn/optGet', rsForPath.optGet () )
          console.log ( 'isFromNameAndDataMenuDefn/parentFound', parentFound )
          console.log ( 'isFromNameAndDataMenuDefn/parentFound.from.display', parentFound.from.display )
          let foundDisplay = parentFound.from.display?. ( [ ...parentFound.from.path, lastPath ] );
          console.log ( 'isFromNameAndDataMenuDefn/foundDisplay', foundDisplay )
          if ( foundDisplay ) return display ( rsForPath, props, foundDisplay )
        }
      }
      const path = isFromSingleDataMenuDefn ( found ) ? found.path : displayPath
      const rsForPath = rsForConfig.chainOpt ( parsePath ( path ) )
      console.log ( 'findDisplay - path', path )
      console.log ( 'findDisplay - found', found )
      console.log ( 'findDisplay - rs', rsForPath )
      if ( found?.display ) return display ( rsForPath, props, found.display ( path ) )
      return display ( rsForPath, props, fns.defaultDisplay ( path ) )
    }
    return display ( rsForConfig, props, fns.displayNothing )
  };
}

export function findMenuAndDisplay<S, Config> ( prefix: string, fns: MenuAndDisplayFnsForRunbook<S, Config>,
                                                mdFn: ( cleanConfig: Config ) => MenuDefnForRunbook<S>, combine: CombinedMenuAndDisplayFn ):
  RunbookComponent<S, RefAndData<SelectionState, Config>> {
  return rs => ( props ) => {
    const rsForSelection: RunbookState<S, SelectionState> = rs.withOpt ( focusOnJustRef ( rs.opt ) )
    let config = props.focusedOn?.data;
    if ( config === undefined ) throw Error ( `No config in ${JSON.stringify ( props.focusedOn )}. Opt ${getDescription(rs.opt)} State is ${JSON.stringify(rs.state,null,2)}` )
    console.log ( 'config', config )
    const menu: RunbookComponent<S, SelectionState> = applyMenuDefn ( prefix, fns, mdFn, config )
    const selectedDisplay = findDisplay ( fns, mdFn )
    return combine ( display ( rsForSelection, props, menu ), display ( rs, props, selectedDisplay ) )
  }
}


export function onMenuClick<S> ( rs: RunbookState<S, SelectionState>, menuPath: string[], selection: string[] | undefined ) {
  return () => rs.set ( { selection, menuPath, displayPath: menuPath?.slice ( 1 ) } )
}
export function toggleShowDropDown<S> ( rs: RunbookState<S, SelectionState>, menuPath: string[] ) {
  return () => {
    const oldMenuPath = rs.optGet ()?.menuPath.join ( '.' )
    const thisMenuPath = menuPath.join ( '.' )
    if ( oldMenuPath === thisMenuPath ) //In this case we are clicking something we have already opened and thus need to hide it
      rs.map ( old => ({ ...old, showDropdowns: !old.showDropdowns, displayPath: old.menuPath }) );

    else//in this case we are clicking something new. Thus we want to show drops downs.
      rs.map ( old => ({ ...old, menuPath, showDropdowns: true }) )
  }
}