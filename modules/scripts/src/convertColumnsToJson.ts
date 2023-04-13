import { fromEntries } from "@runbook/utils";

function zipAll<T1, T2, T3> ( t1s: T1[], t2s: T2[], merge: ( t1: T1, t2: T2 ) => T3 ): T3[] {
  const t1Size = t1s.length
  const t2Size = t2s.length
  const maxSize = Math.max ( t1Size, t2Size )
  const result = []
  for ( let i = 0; i < maxSize; i++ )
    result.push ( merge ( t1s[ i ], t2s[ i ] ) )
  return result
}

const convertOneLineToJson = ( headers: string[] ) => ( text: string ) => {
  const matches = text.split ( /\s+/ )
  if ( matches === null ) throw new Error ( `Cannot match ${text}` )
  return fromEntries ( zipAll ( headers, matches, ( h, m ) => [ h, m ] ) )
};
export const convertColumnsToJson = ( headers: string[], text: string[] ) => {
  return text.map ( convertOneLineToJson ( headers ) )
};

