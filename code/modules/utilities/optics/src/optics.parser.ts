import { appendItem, composeOptional, nthItem, Optional } from "./optional";
import { focusQuery } from "./focuson";
import { identity } from "./iso";

export function parsePath ( path: string[] ) {
  function processPart ( acc: Optional<any, any>, part: string ): Optional<any, any> {
    const match = /^(.*)\[(\d+|append)]$/.exec ( part )
    if ( match ) {
      const first = focusQuery ( acc, match[ 1 ] )
      const nth = match[ 2 ] === 'append' ? appendItem () : nthItem ( Number.parseInt ( match[ 2 ] ) )
      return composeOptional ( first, nth )
    }
    return focusQuery ( acc, part )
  }
  return path.reduce ( processPart, identity<any> () )
}
export function opticsParserO<M, C> ( path: string ): Optional<M, C> {
  const parts = path.split ( "." )
  return parsePath ( parts );
}