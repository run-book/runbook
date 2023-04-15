import { chainOfResponsibility2, fromEntries, zipAll } from "@runbook/utils";
import { DisplayFormat, isTableFormat, TableFormat } from "./displayFormat";


const convertOneLineToJson = ( headers: string[] ) => ( text: string ) => {
  const matches = text.split ( /\s+/ ).map ( s => s.trim () ).filter ( s => s.length > 0 )
  if ( matches === null ) throw new Error ( `Cannot match ${text}` )
  return fromEntries ( zipAll ( headers, matches, ( h, m ) => [ h, m ] ) )
};
export const columnsToJson = ( headers: string[], text: string[] ) => {
  return text.map ( convertOneLineToJson ( headers ) )
};

export const findHeaders = ( tableFormat: TableFormat, text: string[] ) => {
  if ( Array.isArray ( tableFormat.headers ) ) return tableFormat.headers;
  if ( tableFormat.hideHeader ) return text[ 0 ].split ( /\s+/ ).filter ( s => s.length > 0 )
  return text[ 0 ].split ( /\s+/ ).map ( ( _, i ) => `${i + 1}` )
}

export function columnsToDisplay ( format: TableFormat, text: string[] ) {
  function toNum ( n: number | boolean ) {
    return typeof n === 'number' ? n : n ? 1 : 0
  }
  const start = toNum ( format.hideHeader )
  const end = text.length - toNum ( format.hideFooter )
  return text.slice ( start, end )
}

export const stringToJsonForTable = ( text: string[], format: DisplayFormat ) => {
  if ( !isTableFormat ( format ) ) throw new Error ( `Cannot convert to json: ${format}` )
  const headers = findHeaders ( format, text )
  const columns = columnsToDisplay ( format, text )
  return columnsToJson ( headers, columns )
};
export const stringToJsonForJson = ( text: string[] ) => {
  return JSON.parse ( text.join ( '\n' ) )
}
export function stringToJsonForOneLineJson ( text: string[] ) {
  return text.map ( s => JSON.parse ( s ) )
}
export const stringToJson = chainOfResponsibility2<string[], DisplayFormat, any> (
  ( text, format ) => {throw Error ( `Unknown format: ${JSON.stringify ( format )}\n\n${text}` )},
  { isDefinedAt: f => f === 'raw', apply: t => t.join ( '\n' ) },
  { isDefinedAt: f => f === 'json', apply: stringToJsonForJson },
  { isDefinedAt: f => f === 'onelinejson', apply: stringToJsonForJson },
  { isDefinedAt: f => f === 'oneperlinejson', apply: stringToJsonForOneLineJson },
  { isDefinedAt: f => isTableFormat ( f ), apply: stringToJsonForTable } );