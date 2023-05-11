import { Cache, cacheGet, CacheOptions } from "./cache"

function setup (): { cache: Cache<string>, ops: CacheOptions } {
  let time = 1000
  return {
    cache: {}, ops: { hash: ( p ) => JSON.stringify ( p ).replace ( /"/g, '' ), timeFn: () => time++ }
  }
}

describe ( "cache", () => {
  describe ( "when not in", () => {
    it ( "should get the data and add it to the cache", () => {
      const { cache, ops } = setup ()
      const actual = cacheGet ( ops, cache ) ( { a: 1 }, 10, ( p ) => `loaded${p.a}` )
      expect ( actual ).toEqual ( 'loaded1' )
      expect ( cache ).toEqual ( {
        "{a:1}": { "cached": "loaded1", "lastUpdated": 1000, count: 1 }
      } )
    } )
  } )
  describe ( "when in and not stale", () => {
    it ( "should get the data from the cache", () => {
      const { cache, ops } = setup ()
      let initialCached = { "cached": "loaded1", "lastUpdated": 1000, count: 2 };
      cache[ "{a:1}" ] = initialCached
      const actual = cacheGet ( ops, cache ) ( { a: 1 }, 10, ( p ) => `loaded${p.a}` )
      expect ( actual ).toEqual ( 'loaded1' )
      expect ( cache ).toEqual ( { "{a:1}": initialCached } )

    } )
  } )
  describe ( "when in and stale", () => {
    it ( "should get the data and add it to the cache", () => {
      const { cache, ops } = setup ()
      let initialCached = { "cached": "loaded1", "lastUpdated": 0, count: 2 };
      cache[ "{a:1}" ] = initialCached
      const actual = cacheGet ( ops, cache ) ( { a: 1 }, 10, ( p ) => `loaded${p.a}` )
      expect ( actual ).toEqual ( 'loaded1' )
      expect ( cache ).toEqual ( {
        "{a:1}": { "cached": "loaded1", "lastUpdated": 1000, count: 3 }
      } )
    } )
  } )
} )

