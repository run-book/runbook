import { NameAnd } from "@runbook/utils";

export type InheritsFromFn = ( child: string, parent: string ) => boolean

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

/** Currently a very weak implementation, so that I can see if the ideas will work. Obviously
 * we need to add transitive, and we need to consider if we want to optimise this check */
export const inheritsFromUsingParents = ( parents: NameAnd<string[]> ): InheritsFromFn => ( child: string, parent: string ) => parents[ child ]?.includes ( parent );
