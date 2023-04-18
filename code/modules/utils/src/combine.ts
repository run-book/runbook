import { safeObject } from "./safe";
import { NameAnd } from "./nameAnd";

export function combineTwoObjects<T> ( t1: NameAnd<T> | undefined, t2: NameAnd<T> | undefined ): NameAnd<T> | undefined {
  return (t1 === undefined && t2 === undefined) ? undefined : { ...safeObject ( t1 ), ...safeObject ( t2 ) }
}


export const deepCombineTwoObjectsWithPrune = ( prune: ( res: any ) => any ) => ( t1: any, t2: any ): any => {
  if ( t1 === undefined ) return t2
  if ( t2 === undefined ) return t1
  if ( typeof t1 !== 'object' ) return prune ( t2 )
  if ( typeof t2 !== 'object' ) return prune ( t2 )
  var result: any = { ...t1 }
  Object.entries ( t2 ).forEach ( ( [ k, v ] ) => {
    let prunedV = prune ( v );
    if ( t1[ k ] === undefined ) result[ k ] = prunedV
    if ( Array.isArray ( t1[ k ] ) && Array.isArray ( prunedV ) ) result[ k ] = t1[ k ].concat ( prunedV ); else//
    if ( typeof v === 'object' && typeof t1[ k ] === 'object' ) result[ k ] = deepCombineTwoObjects ( t1[ k ], prunedV, prune ); else
      result[ k ] = prunedV
  } )
  return result

};

export function deepCombineTwoObjects ( t1: any, t2: any, prune?: ( res: any ) => any ): any {
  return deepCombineTwoObjectsWithPrune ( prune ? prune : ( res: any ) => res ) ( t1, t2, )
}
