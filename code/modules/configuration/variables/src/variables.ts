//Copyright (c)2020-2023 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
/** ref is like ${xxx} and this returns dic[xxx]. */
import { findPart, firstSegment, lastSegment, NameAnd, safeArray, safeString, toArray } from "@runbook/utils";
import { stringFunctions } from "./stringFunctions";

const debug = require ( 'debug' ) ( 'variables' )
const verbose = require ( 'debug' ) ( 'variables:verbose' )

export interface VariableDefn {
  regex: RegExp
  removeStartEnd: ( s: string ) => string
}
export const dollarsBracesVarDefn: VariableDefn = {
  regex: /(\$\{[^}]*\})/g,
  removeStartEnd: ref => ref.slice ( 2, ref.length - 1 )
}
export const bracesVarDefn: VariableDefn = {
  regex: /(\{[^}]*\})/g,
  removeStartEnd: ref => ref.slice ( 1, ref.length - 1 )
}
export const fulltextVariableDefn: VariableDefn = {
  regex: /(.*^)/g,
  removeStartEnd: ref => ref
}
export const mustachesVariableDefn: VariableDefn = {
  regex: /{{(.*)}}/g,
  removeStartEnd: ref => ref.slice ( 2, ref.length - 2 )
}
export const doubleXmlVariableDefn: VariableDefn = {
  regex: /<<([^>]*)>>/g,
  removeStartEnd: ref => ref.slice ( 2, ref.length - 2 )
}
interface ProcessedVariableResult {
  result?: string
  error?: string | string[]
}

interface DereferenceOptions {
  allowUndefined?: true
  undefinedIs?: string
  throwError?: true
  emptyTemplateReturnsSelf?: true
  variableDefn?: VariableDefn
  functions?: NameAnd<( s: string | undefined ) => string>
}


/** If the string has ${a} in it, then that is replaced by the dic entry */
export function derefence ( context: string, dic: any, s: string, options?: DereferenceOptions ) {
  debug ( 'derefence', context, s, options )
  verbose ( 'derefence - dictionary', dic )
  if ( options?.variableDefn === undefined ) return s;
  if ( s === undefined ) return s
  const regex = options.variableDefn.regex
  let result = s.replace ( regex, match => {
    let result = replaceVar ( context, match, dic, options );
    verbose ( 'derefence ', match, 'result', result )
    return result;
  } );
  debug ( 'derefence result', result )
  return result;
}


function composeVar ( context: string, dic: any, composeString: string, options: DereferenceOptions, commaIfNeeded: boolean ): string {
  const index = composeString.indexOf ( '(' )
  const withoutStartEnd = composeString.slice ( index + 1, -1 )
  // console.log ( 'composeVar', withoutStartEnd )
  const parts = withoutStartEnd.split ( ',' )
  // console.log ( 'parts', parts )
  let raw = parts.map ( s => replaceVarOfTrimmed ( context + ` part of ${composeString}`, dic, s.trim (), options ) )
    .map ( s => safeString ( s ).trim () ).filter ( s => s.length > 0 ).join ( ',' );
  const result = commaIfNeeded && raw.trim ().length > 0 ? raw + ',' : raw
  return result
}
function replaceVarOfTrimmed ( context: string, dic: any, withoutStartEnd: string, options: DereferenceOptions ): string | undefined {
  const obj = findPart ( dic, withoutStartEnd )
  const last = lastSegment ( withoutStartEnd, '.' )
  if ( last === undefined ) return undefined
  const { result, error } = processVariable ( context, dic, last, obj, options )
  if ( error !== undefined ) {
    // console.error('dic',dic)
    if ( options?.throwError ) {
      throw new Error ( context + toArray ( error ).join ( ',' ) )
    } else {return `//DerefenceError-ERROR ${context}. ${error}. Value was ${JSON.stringify ( obj )}`}
  }
  return result
}
function applyFunctions ( withoutEnd: string, context: string, ref: string, options: DereferenceOptions, raw: string | undefined ) {
  const { variableDefn, functions } = options
  const realFunctions = functions ? functions : stringFunctions
  const result = withoutEnd.split ( '|' ).slice ( 1 ).reduce ( ( acc, s ) => {
    const functionCall = s.match ( /([^(]*)\((.*)\)/ )
    if ( functionCall ) {
      const name = functionCall[ 1 ]
      const value = functionCall[ 2 ]
      const fn = realFunctions[ name ]
      if ( fn === undefined ) throw new Error ( `${context}. Cannot process ${ref} as no function [${name}] in ${s} is defined. Legal functions are ${Object.keys ( realFunctions ).join ( ',' )}` )
      const result = fn ( acc, value );
      return result
    }
    const fn = realFunctions[ s ]
    if ( fn === undefined ) throw new Error ( `${context}. Cannot process ${ref} as no function [${s}] is defined. Legal functions are ${Object.keys ( realFunctions ).join ( ',' )}` )
    return fn ( acc, '' )
  }, raw )
  return result;
}
export function replaceVar ( context: string, ref: string, dic: any, options: DereferenceOptions | undefined ): string {
  if ( options === undefined ) return ref
  const optionsNotUndefined = options
  const variableDefn = options.variableDefn
  if ( variableDefn === undefined ) return ref
  const withoutEnd = variableDefn.removeStartEnd ( ref ).trim ()
  if ( withoutEnd === '' && options?.emptyTemplateReturnsSelf ) return ref
  if ( withoutEnd === '' ) return ''
  const first = firstSegment ( withoutEnd, '|' )
  function rawString () {
    if ( first.startsWith ( 'compose(' ) && first.endsWith ( ')' ) ) return composeVar ( context, dic, first, optionsNotUndefined, false )
    if ( first.startsWith ( 'composeWithCommaIfNeeded(' ) && first.endsWith ( ')' ) ) return composeVar ( context, dic, first, optionsNotUndefined, true )
    return replaceVarOfTrimmed ( context + ` Ref is ${ref}`, dic, first, optionsNotUndefined );
  }
  const raw = rawString ();
  const result = applyFunctions ( withoutEnd, context, ref, options, raw );
  if ( result === undefined ) {
    if ( options?.undefinedIs !== undefined ) return options.undefinedIs
    return options.allowUndefined ? '' : `//LAOBAN-UPDATE-ERROR ${context}. ${ref} is undefined`;
  }
  return result
}
function findIndentString ( parts: string[] ): ProcessedVariableResult {
  const indent = parts.find ( s => s.startsWith ( 'indent' ) );
  try {
    const indentValue = indent ? Number.parseInt ( indent.substring ( 6 ) ) : 0
    return { result: ''.padStart ( indentValue ) }
  } catch ( e ) {
    return { result: '', error: `Indent had illegal value ${indent}. Needs to be indentx where x is an integer` }
  }
}
export function processVariable ( context: string, dic: any, nameWithCommands: string, value: any | undefined, options: DereferenceOptions | undefined ): ProcessedVariableResult {
  function error ( error: string | string[] ): ProcessedVariableResult {
    return { result: nameWithCommands, error }
  }
  let mapIndex = nameWithCommands.indexOf ( ':map<<>>(' );
  if ( mapIndex >= 0 ) {
    if ( value === undefined || Array.isArray ( value ) ) {
      const realvalue = safeArray ( value )
      let commaIndex = nameWithCommands.indexOf ( 'comma' );
      const hasCommaRequest = commaIndex > 0 && commaIndex < mapIndex
      const comma = realvalue.length > 0 && hasCommaRequest ? ',' : ''
      const map = nameWithCommands.substring ( mapIndex + 8 )
      const mapParts: RegExpMatchArray | null = map.match ( /^\(([A-Za-z0-9]*)=>(.*)\)$/ )
      if ( mapParts === null ) return error ( `The mapFn was not of form '(variable=>strings)' it was ${map}` )
      const variable = mapParts[ 1 ]
      const mapFn = mapParts[ 2 ]

      const dirWithVar = { ...dic }
      const mapped = realvalue.map ( ( s, i ) => {
        dirWithVar[ variable ] = s
        let newContext = `${context} processing item ${i} in list [${s}]`;
        let result = derefence ( newContext, dirWithVar, mapFn, { ...options, variableDefn: doubleXmlVariableDefn } );
        // console.log('mapped', nameWithCommands,'s',s, 'variable is', variable,'result',result)
        return result;
      } )
      const result = mapped.toString () + comma
      return { result }
    } else
      return error ( `The value is not an array for a map<<>>` )
  }
  if ( value === undefined ) return { result: undefined }


  const parts: string[] = nameWithCommands.split ( ':' ).map ( s => s.trim () ).filter ( s => s.length > 0 )
  if ( parts.length === 0 ) return { result: value }
  if ( parts.length === 1 ) return { result: value }
  const indent = findIndentString ( parts )
  if ( indent.error !== undefined ) return error ( indent.error )
  if ( parts.includes ( 'object' ) ) {
    if ( typeof value !== 'object' ) return error ( `Expected object but was of type ${typeof value} with value ${JSON.stringify ( value )}` )
    const comma = parts.includes ( 'comma' ) && Object.keys ( value ).length > 0 ? ',' : ''
    return { result: toStringRemovingBraces ( value, indent.result || '' ) + comma }
  } else {
    return { result: value.toString () }
  }
}


function toStringRemovingBraces ( ref: any, indent: string ) {
  const result = JSON.stringify ( ref, null, 2 ).split ( "\n" );
  return result.slice ( 1, result.length - 1 ).map ( s => indent + s.substring ( 2 ) ).join ( '\n' )
}
