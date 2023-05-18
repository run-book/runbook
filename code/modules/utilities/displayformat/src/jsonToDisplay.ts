import { chainOfResponsibility, chainOfResponsibility2 } from "@runbook/utils";
import { DisplayFormat, isTableFormat } from "./displayFormat";


export const displayJson = ( json: any ) => JSON.stringify ( json, null, 2 );
export const displayOneLineJson = ( json: any ) => JSON.stringify ( json );
export const displayOnePerLineJson = ( json: any ) => Array.isArray ( json ) ? json.map ( displayOneLineJson ).join ( '\n' ) : displayOneLineJson ( json )
export const displayAsIs = ( json: any ) => json
export const displayAsToString = ( json: any ) => json.toString ()
export const jsonToDisplay = chainOfResponsibility2<any, DisplayFormat, string> ( displayAsIs,
  { isDefinedAt: f => f === 'raw', apply: displayAsIs },
  { isDefinedAt: f => f === 'json', apply: displayJson },
  { isDefinedAt: f => f === 'exitcode==0' || f === 'exitcode', apply: displayAsToString },
  { isDefinedAt: f => f === 'onelinejson', apply: displayOneLineJson },
  { isDefinedAt: f => f === 'oneperlinejson', apply: displayOnePerLineJson },
  { isDefinedAt: f => isTableFormat ( f ), apply: displayJson } )

