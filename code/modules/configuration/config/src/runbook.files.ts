import { findDirectoryHoldingFileOrError } from "@runbook/files";
import path from "path";
import { isErrors, mapErrors } from "@runbook/utils";


export const runbookMarker = ".runbook"
export const configSubDirName = "config"
export const runbookConfigFileName = "runbook.config.json"
export const cachedConfigFileName = "runbook.cached.json"
export const findRunbookDirectoryOrError = ( cwd: string ) =>
  mapErrors ( findDirectoryHoldingFileOrError ( cwd, runbookMarker ), d => path.join ( d, runbookMarker ) );

export function findRunbookDirectoryOrThrow ( cwd: string ) {
  const result = findDirectoryHoldingFileOrError ( cwd, runbookMarker );
  if ( isErrors ( result ) ) throw result.errors;
  return path.join ( result, runbookMarker )

}

export function configSubDir ( runbookDir: string ) {
  return path.join ( runbookDir, configSubDirName )
}
export function configSubDirFromRoot ( runbookDir: string ) {
  return path.join ( runbookDir, runbookMarker,configSubDirName )
}
export function cachedConfigFile ( runbookDir: string ) {
  return path.join ( runbookDir, cachedConfigFileName )
}
export function runbookConfigFile ( runbookDir: string ) {
  return path.join ( runbookDir, runbookConfigFileName )
}