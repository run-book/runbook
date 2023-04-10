import { ErrorsAnd, JsonParser, parseJson } from "@runbook/utils";
import cp from "child_process";

export const fetchShell = <T> ( context: FetchShellContext ) => async <T> ( cwd: string, command: string, args: string[] ): Promise<ErrorsAnd<T>> => {
  const { executeShell, parseJson } = context
  const { stdout, stderr, exitCode } = await executeShell ( cwd, `${command} ${args.join ( ' ' )}` )
  if ( exitCode !== 0 ) return { errors: [ `Error ${exitCode} executing ${command}`, stderr ] }
  return parseJson ( stdout )
}

export interface FetchShellContext {
  executeShell: ExecuteShell
  parseJson: JsonParser
}

export type ExecuteShell = ( cwd: string, command: string ) => Promise<FetchShellResult>

export interface FetchShellResult {
  stdout: string
  stderr: string
  exitCode: number
}

export const executeShell: ExecuteShell = ( cwd: string, cmd: string ): Promise<FetchShellResult> => {
  // console.log('execute', cwd, cmd)
  return new Promise<FetchShellResult> ( resolve => {
    cp.exec ( cmd, { cwd, env: process.env }, ( error, stdout, stdErr ) =>
      resolve ( { stdout, stderr: stdErr, exitCode: error ? error.code : 0 } ) )
  } )
};

export const defaultShellContext: FetchShellContext = { executeShell, parseJson }