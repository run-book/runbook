import {  guard2 } from "@runbook/utils";

export interface DisplayOptions {
  json?: boolean
  oneLineJson?: boolean
  onePerLineJson?: boolean
  columns?: boolean
  hideHeader?: boolean
}

export const displayJson = ( json: any ) => JSON.stringify ( json, null, 2 );
export const displayOneLineJson = ( json: any ) => JSON.stringify ( json );
export const displayOnePerLineJson = ( json: any ) => Array.isArray ( json ) ? json.map ( displayOneLineJson ) : displayOneLineJson ( json )
export const is = ( fn: ( dop ) => boolean ) => guard2<any, DisplayOptions> ( fn )

// export function display ( json: any, displayOptions: DisplayOptions ) {
//   return chainOfResponsibility2<any, DisplayOptions, any> ( displayJson,
//     is ( dop => dop.json ) ( displayJson )
//   )
// }