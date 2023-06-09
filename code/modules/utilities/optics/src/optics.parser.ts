import { appendItem, composeOptional, nthItem, Optional } from "./optional";
import { focusQuery } from "./focuson";
import { identity } from "./iso";
import { addDescription } from "@runbook/utils";

export function parsePath<M, C> ( path: string[] ): Optional<M, C> {
  try {
    function processPart ( acc: Optional<any, any>, part: string ): Optional<any, any> {
      try {
        const match = /^(.*)\[(\d+|append)]$/.exec ( part )
        if ( match ) {
          const first = focusQuery ( acc, match[ 1 ] )
          const nth = match[ 2 ] === 'append' ? appendItem () : nthItem ( Number.parseInt ( match[ 2 ] ) )
          return composeOptional ( first, nth )
        }
        return focusQuery ( acc, part )
      } catch ( e: any ) {
        console.log ( 'Error in parsePath at part', path, part, e )
        throw e
      }
    }
    return addDescription ( path.reduce ( processPart, identity<any> () ), () =>path.join ( "." ) )
  } catch
    ( e: any ) {
    console.log ( 'Error in parsePath', path, e )
    throw e
  }
}
export function opticsParserO<M, C> ( path: string ): Optional<M, C> {
  const parts = path.split ( "." )
  return parsePath ( parts );
}