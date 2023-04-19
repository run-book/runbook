import { mapObjValues, NameAnd } from "./nameAnd";

export function prune ( json: any, key: string ): any {
  if ( Array.isArray ( json ) ) return json.map ( j => prune ( j, key ) )
  if ( typeof json === 'object' ) {
    const copy: NameAnd<any> = mapObjValues ( json, j => prune ( j, key ) )
    delete copy[ key ]
    return copy
  }
  return json
}