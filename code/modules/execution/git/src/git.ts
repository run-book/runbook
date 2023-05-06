import { executeScriptInShell } from "@runbook/scripts";
import path from "path";
import * as os from "os";
import * as fs from "fs";
import { ErrorsAnd } from "@runbook/utils";


export function gitDir ( homeDir: string, repo: string ) {
  return path.join ( homeDir, '.runbook', 'git', repo.replace ( /[\/:.]/g, '_' ).replace ( /_+/g, '_' ) );
}

export function gitCloneToRunbookHome ( homeDir: string, repo: string ) {
  return gitClone ( homeDir, repo, gitDir ( homeDir, repo ) )
}
export async function gitReallyPullToRunbookHome ( homeDir: string, repo: string ) {
  let dir = gitDir ( homeDir, repo );

  const s1 = await executeScriptInShell ( dir, `git add .` )
  const s2 = await executeScriptInShell ( dir, `git reset --hard` )
  const s3 = await executeScriptInShell ( dir, `git pull` )
  return [ s1, s2, s3 ].join ( '\n\n' )
}

/** The string is the text string of what happened */
export type GitCloneFn = ( repoUrl: string ) => Promise<ErrorsAnd<string>>
export type GitDirFn = ( repoUrl: string ) => string

export interface GitOps {
  homeDir: string
  cloneOrPull: GitCloneFn
  cloneIfDoesntExist: GitCloneFn
  gitDir: GitDirFn
  gitExists: ( repoUrl: string ) => Promise<boolean>
}


export type GitCloneOrPullFn = ( homeDir: string, repo: string ) => Promise<ErrorsAnd<string>>
export async function cloneOrPull ( homeDir: string, repo: string ): Promise<ErrorsAnd<string>> {
  const dir = gitDir ( homeDir, repo );
  try {
    await fs.promises.stat ( path.join ( dir, '.git' ) )
    return gitReallyPullToRunbookHome ( homeDir, repo )
  } catch ( e: any ) {
    return gitCloneToRunbookHome ( homeDir, repo )
  }
}
export function gitClone ( cwd: string, repo: string, dir: string ): Promise<ErrorsAnd<string>> {
  return executeScriptInShell ( cwd, `git clone ${repo} ${dir}` )
}

export async function gitCloneIfDoesntExist ( repo: string, dir: string ): Promise<ErrorsAnd<string>> {
  const dotGit = path.join ( dir, '.git' )
  async function exists () {
    try {
      return (await fs.promises.stat ( dotGit )).isDirectory ();
    } catch ( e: any ) {
      return false
    }
  }
  if ( await exists () ) return `${dir} already cloned`
  try {
    await fs.promises.mkdir ( dir, { recursive: true } )
  } catch ( e: any ) {
    console.log ( 'cannot mkdir', dir, e )
    throw e;
  }
  let result = await gitClone ( dir, repo, dir );
  return result
}
export const makeGitOps = ( homeDir: string ): GitOps => ({
  homeDir,
  cloneOrPull: ( repoUrl: string ) => cloneOrPull ( homeDir, repoUrl ),
  cloneIfDoesntExist ( repoUrl: string ): Promise<ErrorsAnd<string>> { return gitCloneIfDoesntExist ( repoUrl, gitDir ( homeDir, repoUrl ) )},
  gitDir: ( repoUrl: string ) => gitDir ( homeDir, repoUrl ),
  gitExists: async ( repoUrl: string ) => {
    try {return (await fs.promises.stat ( path.join ( gitDir ( homeDir, repoUrl ), '.git' ) )).isDirectory ()} catch ( e: any ) {return false}
  }
});
