import { NameAnd, Primitive } from "@runbook/utils";
import { Params } from "@runbook/executors";

export interface CacheData<T> {
  cached: T
  lastUpdated: number
  count: number
}

export type Cache<T> = NameAnd<CacheData<T>>

export interface CacheOptions {
  timeFn: () => number
  hash: ( p: Params ) => string
}

export function makeCacheOptions (): CacheOptions {
  return { timeFn: () => Date.now (), hash: ( p ) => JSON.stringify ( p ).replace ( /"/g, "'" ) }
}
export interface CacheDetails<T> {
  id: string
  cacheDetails: CacheData<T>
}
export const cacheGet = <T> ( cacheOps: CacheOptions, cache: Cache<T> ) => ( params: Params, staleness: number, fn: ( p: Params ) => T ): CacheDetails<T> => {
  const id = cacheOps.hash ( params )
  const cached = cache[ id ]
  let now = cacheOps.timeFn ();
  if ( cached === undefined || now >= cached.lastUpdated + staleness ) {
    let t = fn ( params );
    const count = cached === undefined ? 1 : cached.count + 1
    let cacheDetails = { cached: t, lastUpdated: now, count };
    cache[ id ] = cacheDetails
    return { cacheDetails, id }
  }
  return { cacheDetails: cached, id }
}