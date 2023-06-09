import { chainFromDoItOrUndefined, findFromPath, getDescription, mapObjToArray, NameAnd, PartialFunction, RefAndData, safeObject } from "@runbook/utils";
import { display, RunbookComponent, RunbookProps, RunbookState } from "@runbook/runbook_state";
import { focusOnJustData, focusOnJustRef, Optional, parsePath } from "@runbook/optics";

const debugMenu = require ( 'debug' ) ( 'menu*' )
const debugMenuSelected = console.log// require ( 'debug' ) ( 'menu:selected' )

export type RememberedMode = NameAnd<string>
export interface SelectionState {
  menuPath: string[]
  displayPath?: string[]
  selection?: string[]
  rememberedMode?: RememberedMode
  showDropdowns?: boolean
}
export function currentSelectionMode ( selectionState: SelectionState | undefined ): string {
  if ( !selectionState ) return 'view'
  return selectionState.rememberedMode?.[ selectionState.menuPath.join ( '.' ) ] ?? 'view'
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
  optional?: ( rootOpt: Optional<any, any>, path: string[] ) => Optional<any, any>
}

interface FromDefn<R> {
  path: string[],
  display: ( path: string[] ) => R,
  optional?: ( rootOpt: Optional<any, any>, path: string[] ) => Optional<any, any>
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


function getRsForPath<S> ( m: MenuDefnItem<RunbookComponent<S, any>> | undefined, rsForConfig: RunbookState<S, any>, pathFromFound: string[] ) {
  if ( m?.optional ) {
    const result = rsForConfig.withOpt ( m.optional ( rsForConfig.opt, pathFromFound ) )
    return result
  } else {
    let result = rsForConfig.chainOpt ( parsePath ( pathFromFound ) );
    return result;
  }
}

const findDisplayWhenOnlyParentFound = <S, Config> ( menuDefn: MenuDefn<RunbookComponent<S, any>>,
                                                     rsForConfig: RunbookState<S, Config>,
                                                     props: RunbookProps<any>,
                                                     displayPath: string[] ) => ( found: MenuDefnItem<RunbookComponent<S, any>> | undefined ): JSX.Element | undefined => {
  if ( found ) return undefined;
  debugMenuSelected ( 'findDisplayWhenOnlyParentFound', displayPath )
  let parentPath = displayPath.slice ( 0, -1 );
  const parentFound: MenuDefnItem<RunbookComponent<S, any>> | undefined = findInMd ( menuDefn, parentPath )
  if ( parentFound && isFromNameAndDataMenuDefn ( parentFound ) ) {
    debugMenuSelected ( 'parentPath  && isFromNameAndDataMenuDefn' )
    let lastPath: string = displayPath?.[ displayPath?.length - 1 ];
    debugMenuSelected ( 'lastPath is ', lastPath )
    let pathFromFound = [ ...parentFound.from.path, lastPath ];
    const rsForPath: RunbookState<S, any> = getRsForPath ( parentFound.from, rsForConfig, pathFromFound )
    let foundDisplay = parentFound.from.display?. ( pathFromFound );
    if ( foundDisplay ) return display ( rsForPath, props, foundDisplay )
  }
  debugMenuSelected ( `findDisplayWhenOnlyParentFound didn't return anything`, displayPath )
};


const findDisplayWhenFoundHasFrom = <S, Config> ( menuDefn: MenuDefn<RunbookComponent<S, any>>,
                                                  rsForConfig: RunbookState<S, Config>,
                                                  props: RunbookProps<any>,
                                                  displayPath: string[] ) => ( found: MenuDefnItem<RunbookComponent<S, any>> | undefined, ): JSX.Element | undefined => {
  if ( found?.display ) {
    const path = isFromSingleDataMenuDefn ( found ) ? found.path : displayPath
    const rsForPath = getRsForPath ( found, rsForConfig, path )
    let disp = found.display ( path );
    debugMenuSelected ( 'findDisplay - disp', disp )
    return display ( rsForPath, props, disp )
  }
};

const findFromFns = <S, Config> ( fns: MenuAndDisplayFnsForRunbook<S, Config>,
                                  rsForConfig: RunbookState<S, Config>,
                                  props: RunbookProps<any>,
                                  path: string[],
                                  displayPath: string[] ) => ( found: MenuDefnItem<RunbookComponent<S, any>> | undefined ): JSX.Element | undefined => {
  return display ( getRsForPath ( found, rsForConfig, path ), props, fns.defaultDisplay ( isFromSingleDataMenuDefn ( found ) ? found.path : displayPath ) )
}

export const findDisplay = <S, Config> ( fns: MenuAndDisplayFnsForRunbook<S, Config>, mdFn: ( cleanConfig: Config ) => MenuDefnForRunbook<S> ): RunbookComponent<S, RefAndData<SelectionState, Config>> => {
  return rs => ( props ) => {
    const rsForConfig: RunbookState<S, Config> = rs.withOpt ( focusOnJustData ( rs.opt ) )
    const { focusedOn } = props
    if ( !focusedOn ) return display ( rsForConfig, props, fns.displayNothing )

    let selectionState = focusedOn?.ref;
    const newProps = { ...props, mode: currentSelectionMode ( selectionState ) }
    const config: Config | undefined = focusedOn?.data
    if ( config === undefined ) throw Error ( `No config in ${JSON.stringify ( focusedOn )}` )
    const displayPath = selectionState?.displayPath
    var path = selectionState?.selection
    if ( displayPath && path ) {
      debugMenuSelected ( 'displayPath && path is true', 'displayPath', displayPath, 'path', path )
      let menuDefn = mdFn ( config );
      const found: MenuDefnItem<RunbookComponent<S, any>> | undefined = findInMd ( menuDefn, displayPath )
      let result = chainFromDoItOrUndefined<MenuDefnItem<RunbookComponent<S, any>> | undefined, JSX.Element> (
        () => display ( rsForConfig, newProps, fns.displayNothing ),
        findDisplayWhenOnlyParentFound ( menuDefn, rsForConfig, newProps, displayPath ),
        findDisplayWhenFoundHasFrom ( menuDefn, rsForConfig, newProps, displayPath ),
        findFromFns ( fns, rsForConfig, newProps, path, displayPath )
      ) ( found );
      return result
    } else return display ( rsForConfig, newProps, fns.displayNothing )
  };
}

export function findMenuAndDisplay<S, Config> ( prefix: string, fns: MenuAndDisplayFnsForRunbook<S, Config>,
                                                mdFn: ( cleanConfig: Config ) => MenuDefnForRunbook<S>, combine: CombinedMenuAndDisplayFn ):
  RunbookComponent<S, RefAndData<SelectionState, Config>> {
  return rs => ( props ) => {
    const rsForSelection: RunbookState<S, SelectionState> = rs.withOpt ( focusOnJustRef ( rs.opt ) )
    let config = props.focusedOn?.data;
    if ( config === undefined ) throw Error ( `No config in ${JSON.stringify ( props.focusedOn )}. Opt ${getDescription ( rs.opt )} State is ${JSON.stringify ( rs.state, null, 2 )}` )
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