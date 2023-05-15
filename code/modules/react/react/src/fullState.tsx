import { focusQuery, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { RefAndData } from "@runbook/utils";
import { CleanConfig } from "@runbook/config";
import { SelectionState } from "@runbook/menu_react";
import { FetchCommand } from "@runbook/commands";

export interface FullState {
  config: CleanConfig
  selectionState: SelectionState
  fetchCommands: FetchCommand[]
  status: { executor: {} }
}
export const idOpt = identity<FullState> ()
export const fetchCommandsOpt = focusQuery ( idOpt, 'fetchCommands' )
const configOpt = focusQuery ( idOpt, 'config' )
export const selectionStateOpt = focusQuery ( idOpt, 'selectionState' )
export const refAndDataOpt: Optional<FullState, RefAndData<SelectionState, CleanConfig>> = optionalForRefAndData ( selectionStateOpt, configOpt );