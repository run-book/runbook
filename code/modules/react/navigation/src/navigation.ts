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
export interface CommonMenuDefn {
  type: MenuDefnType
  name: string
}

export interface FromNameAndDataMenuDefn extends CommonMenuDefn {
  path: string[]
  fromNameAndData: MenuDefnType,
}
export function isFromNameAndDataMenuDefn ( menuDefnItem: MenuDefnItem ): menuDefnItem is FromNameAndDataMenuDefn {
  return (menuDefnItem as FromSingleDataMenuDefn).path !== undefined && (menuDefnItem as FromNameAndDataMenuDefn).fromNameAndData !== undefined
}
export interface FromSingleDataMenuDefn extends CommonMenuDefn {
  path: string[]
}
export function isFromSingleDataMenuDefn ( menuDefnItem: MenuDefnItem ): menuDefnItem is FromSingleDataMenuDefn {
  return (menuDefnItem as FromSingleDataMenuDefn).path !== undefined && !isFromNameAndDataMenuDefn ( menuDefnItem )
}

export interface StaticMenuDefn extends CommonMenuDefn {
  children: MenuDefn
}
export function isStaticMenuDefn ( menuDefnItem: MenuDefnItem ): menuDefnItem is StaticMenuDefn {
  return (menuDefnItem as StaticMenuDefn).children !== undefined
}

export type MenuDefnItem = FromNameAndDataMenuDefn | StaticMenuDefn | FromSingleDataMenuDefn
export type MenuDefn = MenuDefnItem[]

function findChildren<R> ( menuPath: string[], fns: MenuDefnFns<R>, data: any, m: MenuDefnItem ): any[] {
  if ( isStaticMenuDefn ( m ) ) return toArray ( m.children ).map ( applyMenuItem ( menuPath, fns, data ) )
  if ( isFromNameAndDataMenuDefn ( m ) ) {
    const fn: MenuFn<R> = fns[ m.fromNameAndData ]
    const dataPath = m.path;
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
const applyMenuItem = <R> ( menuPath: string[], fns: MenuDefnFns<R>, data: any ) => ( m: MenuDefnItem ) => {
  try {
    let newMenuPath = makeNewPath ( menuPath, m.name );
    return fns[ m.type ] ( newMenuPath, (m as any).path, m.name, findChildren ( newMenuPath, fns, data, m ) );
  } catch ( e: any ) {
    console.error ( `Error applying menu item ${JSON.stringify ( m )} at path [${menuPath.join ( '.' )}]`, e )
    throw e
  }
}


export const applyMenuDefn = <R> ( prefix: string, fns: MenuDefnFns<R>, md: MenuDefn, data: any ): R =>
  applyMenuItem ( [], fns, data ) ( { type: 'navBar', name: prefix, children: md } )