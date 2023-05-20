import { Root } from "react-dom/client";
import { identity, Optional } from "@runbook/optics";
import { NameAnd, RefAndData } from "@runbook/utils";

import { addCmd, addListener, newStore, Store } from "@runbook/store";
import { RunbookState } from "@runbook/runbook_state";
import { SelectionState } from "@runbook/menu_react";
import { FetchCommand, fetchMiddleware } from "@runbook/commands";
import { pollMiddleware } from "@runbook/commands/dist/src/poll";
import { StatusEndpointData } from "@runbook/executors";

export type DisplayRsInState<S, Config> = ( newRs: RunbookState<S, RefAndData<SelectionState, Config>> ) => JSX.Element


export function makeStore<S, Config> ( root: Root, initial: S,
                                       fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response>,
                                       refAndDataOpt: Optional<S, RefAndData<SelectionState, Config>>,
                                       fetchCommandOpt: Optional<S, FetchCommand[]>,
                                       statusOpt: Optional<S, NameAnd<StatusEndpointData>>,
                                       displayRs: DisplayRsInState<S, Config> ) {
  const idOpt = identity<S> ()
  const store: Store<S> = newStore ( initial, 10,
    fetchMiddleware ( fetchCommandOpt, fetch ),
    pollMiddleware<S> ( fetch ) )

  const rs = new RunbookState<S, RefAndData<SelectionState, Config>> ( initial, refAndDataOpt,
    s => {
      console.log ( 'addCmd', s )
      addCmd ( store ) ( { set: s, optional: idOpt } );
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