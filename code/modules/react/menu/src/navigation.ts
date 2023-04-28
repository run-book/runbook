import { findFromPath, NameAnd, safeObject, toArray } from "@runbook/utils";


export type RememberedMode = NameAnd<string>
export interface SelectionState {
  menuPath: string[]
  selection?: string[]
  rememberedMode?: RememberedMode
}


export type MenuFn<R> = ( menuPath: string[], path: string[] | undefined, name: string, children?: R[] ) => R

export interface MenuDefnFns<R> {
  navBar: MenuFn<R>
  navBarItem: MenuFn<R>,
  dropdownItem: MenuFn<R>
}


export type MenuDefnType = keyof MenuDefnFns<any>
export interface CommonMenuDefn<R> {
  type: MenuDefnType
  name: string
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
export function isFromNameAndDataMenuDefn<R> ( menuDefnItem: MenuDefnItem<R> ): menuDefnItem is FromNameAndDataMenuDefn<R> {
  return (menuDefnItem as FromNameAndDataMenuDefn<R>).from !== undefined
}
export interface FromSingleDataMenuDefn<R> extends CommonMenuDefn<R> {
  path: string[]
}
export function isFromSingleDataMenuDefn<R> ( menuDefnItem: MenuDefnItem<R> ): menuDefnItem is FromSingleDataMenuDefn<R> {
  return (menuDefnItem as FromSingleDataMenuDefn<R>).path !== undefined && !isFromNameAndDataMenuDefn ( menuDefnItem )
}

export interface StaticMenuDefn<R> extends CommonMenuDefn <R> {
  children: MenuDefn<R>
}
export function isStaticMenuDefn<R> ( menuDefnItem: MenuDefnItem<R> ): menuDefnItem is StaticMenuDefn<R> {
  return (menuDefnItem as StaticMenuDefn<R>).children !== undefined
}

export type MenuDefnItem<R> = FromNameAndDataMenuDefn<R> | StaticMenuDefn<R> | FromSingleDataMenuDefn<R>
export type MenuDefn<R> = MenuDefnItem<R>[]

function findChildren<S, R> ( menuPath: string[], fns: MenuDefnFns<R>, data: any, m: MenuDefnItem<R> ): any[] {
  if ( isStaticMenuDefn ( m ) ) return toArray ( m.children ).map ( applyMenuItem ( menuPath, fns, data ) )
  if ( isFromNameAndDataMenuDefn ( m ) ) {
    const fn: MenuFn<R> = fns[ m.from.type ]
    const dataPath = m.from.path;
    const obj = findFromPath ( data, dataPath )
    if ( typeof obj === 'object' ) return Object.keys ( safeObject ( obj ) ).map ( k =>
      fn ( makeNewPath ( menuPath, k ), makeNewPath ( dataPath, k ), k, [] ) )
    throw Error ( `Data at end of path [${menuPath.join ( '.' )}] was not an object. It was ${typeof obj}\n${JSON.stringify ( data )}` )
  }
  if ( isFromSingleDataMenuDefn ( m ) ) return []
  throw new Error ( 'Unknown menu defn type ' + JSON.stringify ( m ) )
}
function makeNewPath ( path: string[] | undefined, name: string ) {
  if ( path === undefined ) return [ name ]
  return [ ...path, name ];
}
const applyMenuItem = <S, R> ( menuPath: string[], fns: MenuDefnFns<R>, data: any ) => ( m: MenuDefnItem<R> ) => {
  try {
    let newMenuPath = makeNewPath ( menuPath, m.name );
    return fns[ m.type ] ( newMenuPath, (m as any).path, m.name, findChildren ( newMenuPath, fns, data, m ) );
  } catch ( e: any ) {
    console.error ( `Error applying menu item ${JSON.stringify ( m )} at path [${menuPath.join ( '.' )}]`, e )
    throw e
  }
}


export const applyMenuDefn = <R> ( prefix: string, fns: MenuDefnFns<R>, md: MenuDefn<R>, data: any ): R =>
  applyMenuItem ( [], fns, data ) ( { type: 'navBar', name: prefix, children: md } )