import fs from 'fs'
import path from "path";
import * as util from "util";
import { deepCombineTwoObjectsWithPrune, Errors, ErrorsAnd, flatMap, indentAll, isErrors, isPrimitive, mapErrors, mapObjValues, NameAndValidator, toErrorsAnd } from "@runbook/utils";

const astat = util.promisify ( fs.stat );
const areaddir = util.promisify ( fs.readdir );

export const defaultMergeAccept = ( f: string ) => !f.includes ( 'runbook.' ) && f.endsWith ( '.json' )
async function loadAllFiles ( acceptor: ( f: string ) => boolean, dir: string, mutator: ( dir: string, file: string, contents: any ) => ErrorsAnd<any> ) {
  const actualAcceptor = acceptor || defaultMergeAccept
  let files = await walkDirectory ( dir );
  let loaded: Promise<ErrorsAnd<any>>[] = files.filter ( actualAcceptor ).map ( async f => {
    const json = await fs.promises.readFile ( f, 'utf8' );
    try {return mutator ( dir, f, JSON.parse ( json ) )} catch ( e ) {
      return { errors: [ `Malformed JSON in ${f}. Error ${e}` ] }
    }
  } )
  let all = await Promise.all ( loaded );
  let result = toErrorsAnd ( all );
  return result;
}
export async function mergeJsonFiles ( dir: string, mutator: ( dir: string, file: string, contents: any ) => ErrorsAnd<any>, acceptor?: ( f: string ) => boolean ): Promise<ErrorsAnd<any>> {
  return mapErrors ( await loadAllFiles ( acceptor, dir, mutator ),
    all => all.reduce ( deepCombineTwoObjectsWithPrune ( j => j ), {} ) )
}

export interface FileAndResult<T> {
  file: string
  result: T

}
export interface DisplayValidation {
  validation: string[]
}
export function displayFilesAndResultsForValidation ( fs: ErrorsAnd<FileAndResult<string[]>[]> ): ErrorsAnd<DisplayValidation> {
  if ( isErrors ( fs ) ) return { errors: [ `Errors accessing files`, ...indentAll ( fs.errors ) ] }
  let fsWithValidationIssues = fs.filter ( f => f.result.length > 0 );
  return { validation: flatMap ( fsWithValidationIssues, f => [ f.file, ...indentAll ( f.result ) ] ) }
}
export function consoleLogValidationAndShouldExit ( fs: ErrorsAnd<DisplayValidation>, displayNoErrors: boolean, force?: string ): boolean {
  if ( isErrors ( fs ) ) {
    fs.errors.forEach ( x => console.log ( x ) )
    return true
  }
  if ( fs.validation.length > 0 ) {
    console.log ( 'Validation issues' )
    fs.validation.forEach ( x => console.log ( x ) )
    if ( force === undefined ) console.log ( force )
    return true
  }
  if ( displayNoErrors )
    console.log ( 'No validation issues' )
  return false
}
export async function validateJsonFiles ( dir: string, acceptor: ( f: string ) => boolean, validator: NameAndValidator<any> ): Promise<ErrorsAnd<FileAndResult<any>[]>> {
  return loadAllFiles ( acceptor, dir, ( dir, f, json ) => {
    const file = path.relative ( dir, f );
    return ({ file, result: validator ( file ) ( json ) });
  } )
}
export function addFromMutator ( dir: string, file: string, json: any ) {
  function withDepth ( json: any, depth: number ) {
    if ( depth > 2 ) return json
    if ( isPrimitive ( json ) ) return json
    if ( Array.isArray ( json ) ) return json.map ( j => withDepth ( j, depth ) )
    let from = [ path.relative ( dir, file ) ];
    const result = mapObjValues ( json, j => withDepth ( j, depth + 1 ) );
    result.__from = from
    return result
  }
  return withDepth ( json, 0 )
}
export function removeExtra__froms ( json: any ) {
  if ( isPrimitive ( json ) ) return json
  if ( Array.isArray ( json ) ) return json
  if ( json.__from?.length > 0 ) delete json.__from
  return json
}

export async function walkDirectory ( dir: string ): Promise<string[]> {
  let files: string[] = await walkDirectoryPrim ( dir );
  return flatten ( files );
}
//https://stackoverflow.com/questions/52189973/recursive-directory-listing-using-promises-in-node-js
function flatten ( arr ) {
  return arr.reduce ( ( flat, toFlatten ) => flat.concat ( Array.isArray ( toFlatten ) ? flatten ( toFlatten ) : toFlatten ), [] );
}
async function walkDirectoryPrim ( dir: string ) {
  // Get this directory's contents
  const files = await areaddir ( dir );
  // Wait on all the files of the directory
  return Promise.all ( files
    // Prepend the directory this file belongs to
    .map ( f => path.join ( dir, f ) )
    // Iterate the files and see if we need to recurse by type
    .map ( async f => {
      // See what type of file this is
      const stats = await astat ( f );
      // Recurse if it is a directory, otherwise return the filepath
      return stats.isDirectory () ? walkDirectoryPrim ( f ) : f;
    } ) );
}