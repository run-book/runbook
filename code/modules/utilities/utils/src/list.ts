export function flatMap<T, T1> ( l: T[], fn: ( x: T, index: number ) => T1[] ): T1[] {
  let index = 0
  return l.reduce ( ( a, x ) => a.concat ( fn ( x, index++ ) ), [] as T1[] );
}

export function filterToType<T, T1 extends T> ( ts: T[], filter: ( t: T ) => t is T1 ) {
  return ts.filter ( filter ) as T1[]
}

export function zipAll<T1, T2, T3> ( t1s: T1[], t2s: T2[], merge: ( t1: T1, t2: T2 ) => T3 ): T3[] {
  const t1Size = t1s.length
  const t2Size = t2s.length
  const maxSize = Math.max ( t1Size, t2Size )
  const result = []
  for ( let i = 0; i < maxSize; i++ )
    result.push ( merge ( t1s[ i ], t2s[ i ] ) )
  return result
}

export const changeLastItem = <T> ( t: T ) => ( ts: T[] ): T[] => {
  const result = [ ...ts ]
  result[ result.length - 1 ] = t
  return result
};