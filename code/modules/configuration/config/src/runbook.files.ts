import { findDirectoryHoldingFileOrError, findDirectoryHoldingFileOrThrow } from "@runbook/files";
import path from "path";
import { cachedConfigFileName, configSubDirName, runbookConfigFileName, runbookMarker } from "./config";
import { isErrors, mapErrors } from "@runbook/utils";

export const findRunbookDirectoryOrError = ( cwd: string ) =>
  mapErrors ( findDirectoryHoldingFileOrError ( cwd, runbookMarker ), d => path.join ( d, runbookMarker ) );

export function findRunbookDirectoryOrThrow ( cwd: string ) {
  const result = findDirectoryHoldingFileOrError ( cwd, runbookMarker );
  if ( isErrors ( result ) ) throw result.errors;
  return result

}

export function configSubDir ( runBookDir: string ) {
  return path.join ( runBookDir, configSubDirName )
}

export function cachedConfigFile ( runbookDir: string ) {
  return path.join ( configSubDir ( runbookDir ), cachedConfigFileName )
}
export function runbookConfigFile ( runbookDir: string ) {
  return path.join ( configSubDir ( runbookDir ), runbookConfigFileName )
}