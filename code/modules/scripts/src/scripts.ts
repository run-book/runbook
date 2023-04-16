import cp from "child_process";
import { cleanLineEndings, OS } from "@runbook/utils";
import * as os from "os";

export type ExecuteScriptFn = ( cwd: string, cmd: string ) => Promise<string>
export type ExecuteScriptLinesFn = ( cwd: string, cmd: string[] ) => Promise<string>
export const executeScriptInShell: ExecuteScriptFn = ( cwd: string, cmd: string ): Promise<string> => new Promise<string> ( resolve => {
  cp.exec ( cmd, { cwd, env: process.env }, ( error, stdout, stdErr ) => {
    let result = cleanLineEndings ( stdout.toString () + (stdErr.length > 0 ? "\n" + stdErr : '') );
    resolve ( result )
  } )
} );

export const executeScriptLinesInShell: ExecuteScriptLinesFn = ( cwd, cmds ) => {
  return cmds.reduce ( ( acc, cmd ) => acc.then ( async s => s + '\n' + await executeScriptInShell ( cwd, cmd ) ), Promise.resolve ( '' ) )
}

export function osType (): OS {
  let s = os.type ();
  if ( s === "Darwin" ) return s as OS
  if ( s === "Windows_NT" ) return s as OS
  if ( s === "Linux" ) return s as OS
  throw new Error ( `Unknown OS type ${s}. Only Darwin, Windows_NT and Linux are supported.` )
}