export function flatMap<T, T1> ( l: T[], fn: ( x: T, index: number ) => T1[] ): T1[] {
  let index = 0
  return l.reduce ( ( a, x ) => a.concat ( fn ( x, index++ ) ), [] as T1[] );
}

export function filterToType<T, T1 extends T> ( ts: T[], filter: ( t: T ) => t is T1 ) {
  return ts.filter ( filter ) as T1[]
}