import { focusQuery, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { RefAndData } from "@runbook/utils";
import { CleanConfig } from "@runbook/config";
import { SelectionState } from "@runbook/menu_react";

export interface FullState {
  config: CleanConfig
  selectionState: SelectionState
}
export const idOpt = identity<FullState> ()
const configOpt = focusQuery ( idOpt, 'config' )
export const selectionStateOpt = focusQuery ( idOpt, 'selectionState' )
export const refAndDataOpt: Optional<FullState, RefAndData<SelectionState, CleanConfig>> = optionalForRefAndData ( selectionStateOpt, configOpt );