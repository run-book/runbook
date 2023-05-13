export function mapK<A, B> ( a: A[], f: ( a: A ) => Promise<B> ): Promise<B[]> {
  return Promise.all ( a.map ( f ) )
}
export function forEachK<A> ( a: A[], f: ( a: A ) => Promise<void> ): Promise<void> {
  return Promise.all ( a.map ( f ) ).then ( () => {} )
}

export async function forEachKWithNotifyOnError<A> ( as: A[], f: ( a: A ) => Promise<void>, error: ( a: A, e: any ) => Promise<void> ): Promise<void> {
  await Promise.all ( as.map ( async a => {
    try {
      await f ( a );
    } catch ( e: any ) {
      error ( a, e )
    }
  } ) )
}
export async function mapKWithNotifyOnError<T, T1> ( as: T[], f: ( a: T ) => Promise<T1>, error: ( a: T, e: any ) => Promise<void> ): Promise<T1[]> {
  const result: T1[] = []
  await forEachKWithNotifyOnError ( as, async a => {result.push ( await f ( a ) )}, error )
  return result
}

export async function foldWithNotify<Acc, V> ( vs: V[], zero: Acc, foldFn: ( acc: Acc, v: V ) => Acc, error: ( e: any, acc: Acc, v: V ) => Promise<void> ): Promise<Acc> {
  let result = zero
  for ( let v of vs ) {
    try {
      result = foldFn ( result, v )
    } catch ( e: any ) {
      await error ( e, result, v )
    }
  }
  return result
}