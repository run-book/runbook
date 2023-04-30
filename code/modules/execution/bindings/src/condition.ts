import { fromEntries, isDescendantOfInNameAnd, NameAnd } from "@runbook/utils";


/** This is a place for firstly optimisation (it's better to match on things that don't bind first)
 *  and secondly to make sure that things in the merelogy parent name spaces are matched first
 *
 *  This is currently very inefficient. It recalculates the same data repeatedly... But we want to play
 *  with it first to see if the approach will work
 */
type VKVD = { kv: [ string, any ], vd: ValueData }
export function deepSortCondition ( mereology: NameAnd<string[]>, context: string, t: any ): any {
  if ( Array.isArray ( t ) ) return t.map ( a => deepSortCondition ( mereology, context, a ) ).sort ()
  if ( typeof t === 'object' ) {
    const vds: VKVD[] = Object.entries ( t ).map ( ( kv ) => ({ kv, vd: getValueDataForSort ( kv ) }) )
      .sort ( ( a, b ) => compareValueForSort ( mereology, context ) ( a.vd, b.vd ) )
    const res = fromEntries ( vds.map ( v => v.kv ) )
    return res
  }
  return t
}
export const zeroValueDepth: ValueData = { depth: 0, variables: 0, namespaces: [] };

export function getValueDataForSort ( t: any ): ValueData {
  if ( Array.isArray ( t ) ) return addOne ( t.reduce ( ( acc, v ) => composeValueData ( acc, getValueDataForSort ( v ) ), zeroValueDepth ) )
  if ( typeof t !== 'object' ) return typeof t === 'string' && t.startsWith ( '{' ) && t.endsWith ( '}' ) ? valueDataForVariable ( t ) : zeroValueDepth;
  return addOne ( Object.entries ( t ).reduce<ValueData> ( ( acc, v ) => composeValueData ( acc, getValueDataForSort ( v ) ), zeroValueDepth ) )
}
function valueDataForVariable ( t: string ): ValueData {
  const withoutBrackets = t.substring ( 1, t.length - 1 )
  const split = withoutBrackets.split ( ':' )
  if ( split.length === 2 ) return { ...zeroValueDepth, namespaces: [ split[ 1 ] ], variables: 1 }
  return { ...zeroValueDepth, variables: 1 }
}
function addOne ( v: ValueData ): ValueData {
  return {
    ...v, depth: v.depth + 1,
  }
}
function composeValueData ( one: ValueData, two: ValueData ): ValueData {
  return {
    depth: Math.max ( one.depth, two.depth ),
    namespaces: one.namespaces.concat ( two.namespaces ),
    variables: one.variables + two.variables
  }
}

export interface ValueData {
  depth: number
  variables: number
  namespaces: string[]
}
export const compareValueForSort = ( mereology: NameAnd<string[]>, context: string ) => ( one: ValueData, two: ValueData ): number => {
  const nsCompareOne = one.namespaces.some ( ns1 => two.namespaces.some ( ns2 => isDescendantOfInNameAnd ( mereology, true ) ( ns1, ns2 ) ) )
  const nsCompareTwo = two.namespaces.some ( ns2 => one.namespaces.some ( ns1 => isDescendantOfInNameAnd ( mereology, true ) ( ns2, ns1 ) ) )
  if ( nsCompareOne && nsCompareTwo )
    throw Error ( `${context}\nHave issue in the mereology. Some of the namespaces are both descendants of each other and ancestors of each other.\n${one.namespaces}\n${two.namespaces}` )
  if ( nsCompareOne ) return 1;
  if ( nsCompareTwo ) return -1;
  let fromVariables = one.variables - two.variables;
  if ( fromVariables !== 0 ) return fromVariables;
  return one.namespaces.length - two.namespaces.length;
};