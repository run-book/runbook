import { findDirectoryHoldingFileOrThrow } from "@runbook/files";
import path from "path";
import { configFileName, configSubDirName, runbookMarker } from "./config";

export function findRunbookDirectory ( cwd: string ) {
  return path.join ( findDirectoryHoldingFileOrThrow ( cwd, runbookMarker ), runbookMarker );
}

export function configSubDir ( runBookDir: string ) {
  return path.join ( runBookDir, configSubDirName )
}

export function configFile(runbookDir: string ) {
  return path.join ( runbookDir, configFileName )
}