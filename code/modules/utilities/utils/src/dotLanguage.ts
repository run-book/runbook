import { allButLastSegment, firstSegment, lastSegment } from "./strings";

export function findPart ( dic: any, ref: string ): any {
  if ( ref === undefined ) return undefined
  if ( ref === '' ) return dic
  const parts = ref.split ( '.' )
  try {
    return parts.reduce ( ( acc, part ) => acc[ firstSegment ( part, ':' ) ], dic )
  } catch ( e ) {return undefined}
}

export const deletePath = <T> ( obj: T ) => ( ref: string ): T => {
  if ( ref === undefined ) return obj

  let last = lastSegment ( ref, );
  let path = allButLastSegment ( ref, );
  if ( path === undefined || last === undefined ) return obj
  const found = findPart ( obj, path )
  delete found?.[ last ]
  return obj
};