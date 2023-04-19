import { NameAnd } from "@runbook/utils";


export const stringFunctions: NameAnd<( s: string | undefined, text: string ) => string | undefined> = {
  toLowerCase: s => s && s.toLowerCase (),
  toUpperCase: s => s && s.toUpperCase (),
  toTitleCase: s => s && s.replace ( /\w\S*/g, function ( txt ) {return txt.charAt ( 0 ).toUpperCase () + txt.substr ( 1 ).toLowerCase ();} ),
  toFirstUpper: s => s && (s === '' ? s : s.charAt ( 0 ).toUpperCase () + s.slice ( 1 )),
  toSnakeCase: s => s && s.replace ( /([a-z])([A-Z])/g, '$1_$2' ).toLowerCase (),
  toPackage: s => s && s.replace ( /\./g, '/' ),
  "default": ( s, text ) => s !== undefined ? s : text,
}