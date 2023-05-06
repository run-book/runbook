import { GitCloneFn, GitDirFn, GitOps } from "./git";
import { ErrorsAnd, findPart, flatten, isErrors, mapArrayErrorsK, mapErrors, mapErrorsK } from "@runbook/utils";
import * as fs from "fs";
import { loadAndParseFile } from "@runbook/files";
import path from "path";

/** Given the url of a git repo, it finds the parent git repos.
 * Note that this allows us to be very generic. We don't say how this happens. Is it
 * through configuration? Data in the repo? Who cares!
 * */
export type ParentsFn = ( repo: string ) => Promise<ErrorsAnd<string[]>>


export const cloneGitRepoAndParentsIfNeeded = ( cloneIfDoesntExist: GitCloneFn, parentsFn: ParentsFn ) => async ( repo: string ): Promise<ErrorsAnd<string[]>> =>
  mapErrorsK ( await cloneIfDoesntExist ( repo ), async () => {
    return mapErrors ( await parentsFn ( repo ), async parents =>
      mapErrors ( await mapArrayErrorsK ( parents, cloneGitRepoAndParentsIfNeeded ( cloneIfDoesntExist, parentsFn ) ),
        lists => [ repo, ...flatten ( lists ) ] ) )
  } );

/** The path is the offset in the repo for the file. The field can be a.b.c etc... it is the field in the JSON in the file that represents parents*/
export function parentsFromPathAndField ( gitDirFn: GitDirFn, fileInRepo: string, field: string ): ParentsFn {
  return async ( repo: string ) => {
    const fileName = path.join ( gitDirFn ( repo ), fileInRepo )
    let contents = await loadAndParseFile ( fileName );
    if ( isErrors ( contents ) ) return []
    let result = findPart ( contents, field );
    if ( result === undefined ) return []
    if ( Array.isArray ( result ) ) return result as string[]
    return { errors: [ `Repo: ${repo} file: ${fileName}, path: ${field} was not an array it was ${JSON.stringify ( result )}` ] }
  }
}
export function defaultCloneGitRepoAndparentsIfNeeded ( gitOps: GitOps ) {
  return cloneGitRepoAndParentsIfNeeded ( gitOps.cloneIfDoesntExist,
    parentsFromPathAndField ( gitOps.gitDir, '.runbook/runbook.config.json', 'parents' ) )
}

