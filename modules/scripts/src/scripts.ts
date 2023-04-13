import cp from "child_process";
import { cleanLineEndings } from "@runbook/utils";

export function execute ( cwd: string, cmd: string ): Promise<string> {
  return new Promise<string> ( resolve => {
    cp.exec ( cmd, { cwd, env: process.env }, ( error, stdout, stdErr ) => {
      let result = cleanLineEndings ( stdout.toString () + (stdErr.length > 0 ? "\n" + stdErr : '') );
      resolve ( result )
    } )
  } )
}
