import { safeArray } from "@runbook/utils";

export function addDebug ( debug?: string[] ) {
  if ( debug ) process.env[ "DEBUG" ] = debug.join ( " " )
}