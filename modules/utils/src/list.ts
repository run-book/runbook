export function flatMap<T, T1> ( l: T[], fn: ( x: T ) => T1[] ): T1[] {
  return l.reduce ( ( a, x ) => a.concat ( fn ( x ) ), [] as T1[] );
}