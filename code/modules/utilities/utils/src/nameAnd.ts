import { ErrorsAnd, isErrors } from "./errors";
import { flatMap } from "./list";

export type NameAnd<T> = { [ name: string ]: T }

export function mapObjValues<T, T1> ( obj: NameAnd<T>, fn: ( t: T, name: string, i: number ) => T1 ): NameAnd<T1> {
  const result: NameAnd<T1> = {}
  let i = 0
  for ( const name in obj ) result[ name ] = fn ( obj[ name ], name, i++ )
  return result
}

export function recursivelyMap<T, T1> ( obj: NameAnd<T>, fn: ( path: string[], name: string, value: T ) => T1 ): T1[] {
  function recurse ( path: string[], obj: any ): T1[] {
    if ( typeof obj !== 'object' ) return []
    return flatMapEntries ( obj, ( t, n ) => {
      let thisOne = fn ( path, n, t as T );
      const children = (typeof t === "object") ? recurse ( [ ...path, n ], t ) : []
      return [ thisOne, ...children ];
    } )
  }
  return recurse ( [], obj )
}
export function collectObjValues<T, T1> ( obj: NameAnd<T>, acceptor: ( t: T, name: string, i: number ) => boolean, fn: ( t: T, name: string, i: number ) => T1 ): NameAnd<T1> {
  const result: NameAnd<T1> = {}
  let i = 0
  for ( const name in obj )
    if ( acceptor ( obj[ name ], name, i ) ) result[ name ] = fn ( obj[ name ], name, i++ )
  return result
}

export async function mapObjValuesK<T, T1> ( obj: NameAnd<T>, fn: ( t: T, name: string, i: number ) => Promise<T1> ): Promise<NameAnd<T1>> {
  const promises: Promise<[ string, T1 ]>[] = Object.keys ( obj ).map ( ( name, i ) => fn ( obj[ name ], name, i ).then ( t1 => [ name, t1 ] ) )
  const result = Promise.all ( promises ).then ( entries => fromEntries ( entries ) )
  return result
}

export function merge2Objs<T1, T2, T> ( one: NameAnd<T1>, two: NameAnd<T2>, fn: ( t1: T1, t2: T2 ) => T ): NameAnd<T> {
  const result: NameAnd<T> = {}
  for ( const name in one ) result[ name ] = fn ( one[ name ], two[ name ] )
  return result

}

export function mapObjToArray<T, T1> ( obj: NameAnd<T>, fn: ( t: T, name: string, i: number ) => T1 ): T1[] {
  const result: T1[] = []
  let i = 0
  for ( const name in obj ) result.push ( fn ( obj[ name ], name, i++ ) )
  return result
}
export function flatMapEntries<T, T1> ( o: NameAnd<T>, fn: ( t: T, name: string ) => T1[] ): T1[] {
  return flatMap ( Object.entries ( o ), ( [ name, t ] ) => fn ( t, name ) )
}
export function fromEntries<T> ( entries: [ string, T ][] ): NameAnd<T> {
  const result: NameAnd<T> = {}
  for ( const [ name, t ] of entries ) result[ name ] = t
  return result
}

export async function mapObjErrorK<T, T1> ( obj: NameAnd<ErrorsAnd<T>>, fn: ( t: T, name: string, i: number ) => Promise<ErrorsAnd<T1>> ): Promise<NameAnd<ErrorsAnd<T1>>> {
  const result: NameAnd<T1> = {}
  /** Note that we are doing these requests in parallel. If I did this in one step awaiting each one, I would have to do them in order. */
  const nameAndResultsPromiseArray: Promise<[ string, ErrorsAnd<T1> ]>[] = mapObjToArray<ErrorsAnd<T>, Promise<[ string, ErrorsAnd<T1> ]>> ( obj, async ( t, name, i ) => {
    if ( isErrors ( t ) ) return [ name, t ];
    const t1: ErrorsAnd<T1> = await fn ( t, name, i )
    return [ name, t1 ]
  } )
  const nameAndResults: [ string, ErrorsAnd<T1> ][] = await Promise.all ( nameAndResultsPromiseArray )
  return fromEntries ( nameAndResults )
}

export interface ObjEqualMessages<T> {
  oneIsNull: string
  twoIsNull: string
  lengthMismatch: ( one: number, two: number ) => string
  keyMismatch: ( one: string, legal: string[] ) => string
  valueMismatch: ( key: string, one: T, two: T ) => string
}
export function objsEqualOrMessages<T> ( msgs: ObjEqualMessages<T>, one: NameAnd<T>, two: NameAnd<T> ): string[] {
  if ( one === null ) return [ msgs.oneIsNull ]
  if ( two === null ) return [ msgs.twoIsNull ]
  const oneKeys = Object.keys ( one ).sort ()
  const twoKeys = Object.keys ( two )
  if ( oneKeys.length !== twoKeys.length ) return [ msgs.lengthMismatch ( oneKeys.length, twoKeys.length ) ]
  const result: string[] = []
  for ( const key of oneKeys ) {
    if ( !twoKeys.includes ( key ) ) result.push ( msgs.keyMismatch ( key, oneKeys ) )
    else if ( one[ key ] !== two[ key ] ) result.push ( msgs.valueMismatch ( key, one[ key ], two[ key ] ) )
  }
  return result
}