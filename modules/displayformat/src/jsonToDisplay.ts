import { chainOfResponsibility } from "@runbook/utils";
import { DisplayFormat, isTableFormat } from "./displayFormat";


export const displayJson = ( json: any ) => JSON.stringify ( json, null, 2 );
export const displayOneLineJson = ( json: any ) => JSON.stringify ( json );
export const displayOnePerLineJson = ( json: any ) => Array.isArray ( json ) ? json.map ( displayOneLineJson ) : displayOneLineJson ( json )
export const displayAsIs = ( json: any ) => json
export function jsonToDisplay ( json: any, format: DisplayFormat ) {
  chainOfResponsibility ( displayAsIs,
    { isDefinedAt: f => f === 'asis', apply: displayAsIs },
    { isDefinedAt: f => f === 'json', apply: displayJson },
    { isDefinedAt: f => f === 'onelinejson', apply: displayOneLineJson },
    { isDefinedAt: f => f === 'oneperlinejson', apply: displayOnePerLineJson },
    { isDefinedAt: f => isTableFormat ( f ), apply: displayJson } )
}
