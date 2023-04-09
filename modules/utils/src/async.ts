export function mapK<A, B> ( a: A[], f: ( a: A ) => Promise<B> ): Promise<B[]> {
  return Promise.all ( a.map ( f ) )
}
export function forEachK<A> ( a: A[], f: ( a: A ) => Promise<void> ): Promise<void> {
  return Promise.all ( a.map ( f ) ).then ( () => {} )
}

