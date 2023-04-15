import { safeObject } from "./safe";
import { NameAnd } from "./nameAnd";

export function combineTwoObjects<T> ( t1: NameAnd<T> | undefined, t2: NameAnd<T> | undefined ): NameAnd<T> | undefined {
  return (t1 === undefined && t2 === undefined) ? undefined : { ...safeObject ( t1 ), ...safeObject ( t2 ) }
}
export function deepCombineTwoObjects ( t1: any, t2: any ): any {
  if ( t1 === undefined ) return t2
  if ( t2 === undefined ) return t1
  if ( typeof t1 !== 'object' ) return t2
  if ( typeof t2 !== 'object' ) return t2
  var result: any = { ...t1 }
  Object.entries ( t2 ).forEach ( ( [ k, v ] ) => {
    if ( t1[ k ] === undefined ) result[ k ] = v
    if ( Array.isArray ( t1[ k ] ) && Array.isArray ( v ) ) result[ k ] = t1[ k ].concat ( v ); else//
    if ( typeof v === 'object' && typeof t1[ k ] === 'object' ) result[ k ] = deepCombineTwoObjects ( t1[ k ], v ); else
      result[ k ] = v
  } )
  return result

}