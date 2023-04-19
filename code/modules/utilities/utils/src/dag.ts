import { NameAnd } from "./nameAnd";

export interface StringDag {
  parents: NameAnd<string[]>
  children: NameAnd<string[]>
}

export function makeStringDag ( children: NameAnd<string[]> ): StringDag {
  const parents: NameAnd<string[]> = {}
  Object.entries ( children ).forEach ( ( [ k, v ] ) => {
    v.forEach ( ( c ) => {
      parents[ c ] = parents[ c ] || []
      parents[ c ].push ( k )
    } )
  } )
  return { parents, children }
}

export const isDescendantOfInNameAnd = ( na: NameAnd<string[]>, strict?: boolean ) => ( parent: string, child: string ): boolean => {
  if ( child === undefined ) return false
  if ( !strict && parent === child ) return true
  let children = na[ parent ];
  if ( children === undefined ) return false
  if ( children.includes ( parent ) ) return true
  return children.some ( ( c ) => isDescendantOfInNameAnd ( na ) ( c, child ) )
};

export const inheritsFrom = ( dag: StringDag, strict?: boolean ) => ( child: string, parent: string, ): boolean => {
  return isDescendantOfInNameAnd ( dag.parents,strict ) ( child, parent )
}