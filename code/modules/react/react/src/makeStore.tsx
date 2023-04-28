import { Root } from "react-dom/client";
import { identity, Optional } from "@runbook/optics";
import { RefAndData } from "@runbook/utils";

import { addCmd, addListener, newStore, Store } from "@runbook/store";
import { RunbookState } from "@runbook/runbook_state";
import { SelectionState } from "@runbook/menu_react";

export type DisplayRsInState<S, Config> = ( newRs: RunbookState<S, RefAndData<SelectionState, Config>> ) => JSX.Element
export function makeStore<S, Config> ( root: Root, initial: S, refAndDataOpt: Optional<S, RefAndData<SelectionState, Config>>, displayRs: DisplayRsInState<S, Config> ) {
  const store: Store<S> = newStore ( initial, 10 )
  const idOpt = identity<S> ()

  const rs = new RunbookState<S, RefAndData<SelectionState, Config>> ( initial, refAndDataOpt,
    s => {
      console.log ( 'addCmd', s )
      addCmd ( store, { set: s, optional: idOpt } );
    } )

  addListener ( store, {
    updated: async ( s: S ) => {
      console.log ( 'updated', s );
      const newRs = rs.withNewState ( s )
      root.render ( displayRs ( newRs ) )
      console.log ( 'and rerendered!' );
    },
    error: async ( s: S, e: Error ) => {
      console.log ( 'error', e );
      console.log ( 'state in error was', s )
    }
  } )
  return { store, rs };
}