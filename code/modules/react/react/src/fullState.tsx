import { focusQuery, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { NameAnd, RefAndData } from "@runbook/utils";
import { CleanConfig } from "@runbook/config";
import { SelectionState } from "@runbook/menu_react";
import { FetchCommand } from "@runbook/commands";
import { StatusEndpointData } from "@runbook/executors";
import { RunbookDebug } from "@runbook/debug";

export interface FullState {
  config: CleanConfig
  selectionState: SelectionState
  fetchCommands: FetchCommand[]
  status: { 'executor': NameAnd<StatusEndpointData> }
  instrumentResult?: any,
  debug?: RunbookDebug
}
export const idOpt = identity<FullState> ()
export const instrumentResultOpt = focusQuery ( idOpt, 'instrumentResult' )
export const fetchCommandsOpt = focusQuery ( idOpt, 'fetchCommands' )
export const executorStatusOpt = focusQuery ( focusQuery ( idOpt, 'status' ), 'executor' )
const configOpt = focusQuery ( idOpt, 'config' )
export const selectionStateOpt = focusQuery ( idOpt, 'selectionState' )
export const situationOpt = focusQuery ( configOpt, 'situation' )
export const refAndDataOpt: Optional<FullState, RefAndData<SelectionState, CleanConfig>> = optionalForRefAndData ( selectionStateOpt, configOpt );