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

function getNameSpace ( nameAndNameSpaceOrJustName: string ) {
  const index = nameAndNameSpaceOrJustName.indexOf ( ':' )
  const nameSpace = index === -1 ? nameAndNameSpaceOrJustName : nameAndNameSpaceOrJustName.substring ( index + 1 )
  return nameSpace;
}
export const isDescendantOfInNameAnd = ( na: NameAnd<string[]>, strict?: boolean ) => ( parent: string, child: string ): boolean => {
  if ( child === undefined ) return false
  const parentNameSpace = getNameSpace ( parent );
  const childNameSpace = getNameSpace ( child )
  if ( !strict && parentNameSpace === childNameSpace ) return true
  let children = na[ parentNameSpace ];
  if ( children === undefined ) return false
  if ( children.includes ( parentNameSpace ) ) return true
  let result = children.some ( ( c ) =>
    isDescendantOfInNameAnd ( na ) ( c, childNameSpace ) );
  return result
};

export const inheritsFrom = ( dag: StringDag, strict?: boolean ) => ( child: string, parent: string, ): boolean => {
  return isDescendantOfInNameAnd ( dag.parents, strict ) ( child, parent )
}