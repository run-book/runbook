//Copyright (c)2020-2022 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react'
import { CleanConfig } from "@runbook/config";

import { createRoot } from "react-dom/client";
import { startProcessing } from "@runbook/store";
import { getElement } from "./react.helpers";
import { executorStatusOpt, fetchCommandsOpt, FullState, instrumentResultOpt, refAndDataOpt, selectionStateOpt, situationOpt } from "./fullState";
import { DisplayRsInState, makeStore } from "./makeStore";
import { bootStrapCombine, bootstrapMenu, changeMode, findMenuAndDisplay, MenuAndDisplayFnsForRunbook, MenuDefn, MenuDefnForRunbook, SelectionState } from "@runbook/menu_react";
import { composeOptional, focusOnJustData, Optional, optionalForTuple3, parsePath } from "@runbook/optics";
import { display, displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { displayScriptInstrument } from "@runbook/instruments_react";
import { displayViewTabs, optForViewTab } from "@runbook/views_react";
import { DisplayMereologyContext, runbookCompAllDataFor } from "@runbook/referencedata_react";
import { BindingContext } from "@runbook/bindings";
import { mereologyToSummary } from "@runbook/mereology";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom, last, makeStringDag, NameAnd, prune, RefAndData } from "@runbook/utils";
import { tableProps } from "@runbook/bindings_react";
import { FetchCommand } from "@runbook/commands";
import { displayExecutors } from "@runbook/executors_react";
import { poll } from "@runbook/commands/dist/src/poll";
import { inheritance } from "@runbook/fixtures";
import { StatusEndpointData } from "@runbook/executors";
import { toggleButton } from "@runbook/components";
import { showDebug } from "@runbook/debug";


// let requestInfoForExecutorsStore = window.location.href + 'executeStatus';

//This still isn't right: look at the way we have two ways of definng the executorStatusOpt... Need to see how to make it nicer
export function menuDefn<S> ( fetchCommandOpt: Optional<S, FetchCommand[]>,
                              selectionStateOpt: Optional<S, SelectionState>,
                              situationOpt: Optional<S, any>,
                              targetOpt: Optional<S, any>,
                              executorStatusOpt: Optional<S, NameAnd<StatusEndpointData>>,
                              bc: BindingContext,
                              display: ( name: string ) => ( path: string[] ) => RunbookComponent<S, any>,
                              dispRefData: ( path: string[] ) => RunbookComponent<S, any> ): MenuDefn<RunbookComponent<S, any>> {
  return {
    Ontology: {
      type: 'navBarItem', path: [], display: display ( 'ontology' ),
      children: {
        Mereologies: { type: 'dropdownItem', path: [ 'mereology' ], display: display ( 'mereology item' ), },
        "Reference Data (Raw)": { type: 'dropdownItem', path: [ 'reference' ], display: display ( 'reference item' ), },
        "Inheritances": { type: 'dropdownItem', path: [ 'inheritance' ], display: display ( 'inheritance item' ), }
      }
    },
    ReferenceData: { type: 'navBarItem', from: { type: 'dropdownItem', path: [ 'reference' ], display: dispRefData } },
    Instruments: {
      type: 'navBarItem', from: {
        type: 'dropdownItem', path: [ 'instrument' ],
        optional: ( rootOpt, path ) => optionalForTuple3 ( composeOptional ( rootOpt, parsePath ( path ) ), targetOpt, executorStatusOpt ),
        display: path => displayScriptInstrument<S> ( fetchCommandOpt, last ( path ), 'instrument', 'instrumentResult' )
      }
    },
    Views: {
      type: 'navBarItem', from: {
        type: 'dropdownItem',
        path: [ 'view' ],
        optional: optForViewTab ( selectionStateOpt, situationOpt ),
        display: path => displayViewTabs<S> ( bc )
      }
    },
    Status: {
      type: 'navBarItem', path: [ 'status' ], display: display ( 'status' ),
      children: {
        "Executors": {
          type: 'dropdownItem',
          optional: ( root, path ) => parsePath ( path ),
          path: [ 'status', 'executor' ],
          display: path => displayExecutors (),
        },
      }
    },
  }
}

export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( name: string ) => ( path: string[] ): RunbookComponent<S, any> =>
  st => props => <div><h1> {name} {path.join ( '.' )} - {modeFromProps ( props )}</h1>
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'view' ) )}
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'edit' ) )}
    {jsonMe ( st )}</div>;


const menuFns: MenuAndDisplayFnsForRunbook<FullState, any> = bootstrapMenu<FullState, any> ()
function dispMContext ( config: CleanConfig ): DisplayMereologyContext {
  const bc: BindingContext = {
    debug: false,
    mereology: mereologyToSummary ( config.mereology ),
    refDataFn: fromReferenceData ( config.reference ),
    inheritsFrom: inheritsFrom ( makeStringDag ( config.inheritance ) )
  }

  return {
    bc,
    displayBindingProps: tableProps,
    m: config.mereology,
    r: config.reference
  }
}


const md = ( bc: BindingContext ) => ( config: CleanConfig, ): MenuDefnForRunbook<FullState> =>
  menuDefn ( fetchCommandsOpt, selectionStateOpt, situationOpt, instrumentResultOpt, executorStatusOpt, bc,
    fixtureDisplayWithMode<FullState> ( selectionStateOpt ),
    runbookCompAllDataFor ( dispMContext ( config ) ) )


export const displayRsForMenuDefn = ( bc: BindingContext ): DisplayRsInState<FullState, CleanConfig> =>
  rs => {
    return <div>{display ( rs, { mode: 'view' }, findMenuAndDisplay<FullState, CleanConfig> ( 'nav', menuFns, md ( bc ), bootStrapCombine ) )}</div>;
  }


const loc = window.location.href
const filename = loc + 'config'
console.log ( 'loc: ', loc, 'filename: ', filename );
const rootElement = getElement ( "root" );

function mainDisplay ( bc: BindingContext ): DisplayRsInState<FullState, CleanConfig> {
  // const debugL: Optional<FullState, RunbookDebug>  = focusQuery ( identity<FullState> (), "debug" ) as any;
  const showDebugL: Optional<CleanConfig, boolean> = parsePath ( [ 'debug' , 'showDebug'] )
  return ( newRs: RunbookState<FullState, RefAndData<SelectionState, CleanConfig>> ) => {
    let justData: Optional<FullState, CleanConfig> = focusOnJustData<FullState, SelectionState, CleanConfig> ( newRs.opt );
    const rsForData: RunbookState<FullState, boolean> = newRs.withOpt ( composeOptional ( justData, showDebugL ) )
    return <>
      {displayRsForMenuDefn ( bc ) ( newRs )}
      <hr/>
      {display<FullState, boolean> ( rsForData, {}, toggleButton ('Hide Debug', 'Show Debug') )}
      {display ( rsForData, {}, showDebug () )}
    </>;
  }

}
const requestInfoForExecutorsStore = 'executeStatus';
fetch ( filename ).then ( response => response.json () ).then ( config => {
  const realConfig: CleanConfig = prune ( config, '__from' )
  let initial: FullState = { config: realConfig, selectionState: { menuPath: [ 'situation' ] }, fetchCommands: [], status: { executor: {} } };
  const root = createRoot ( rootElement )
  const bc: BindingContext = {
    debug: false,
    mereology: mereologyToSummary ( realConfig.mereology ),
    refDataFn: fromReferenceData ( realConfig.reference ),
    inheritsFrom: inheritsFrom ( makeStringDag ( realConfig.inheritance ) )
  }

  const { store, rs } =
          makeStore<FullState, CleanConfig> ( root, initial,
            fetch,
            refAndDataOpt,
            fetchCommandsOpt,
            executorStatusOpt,
            mainDisplay ( bc ) );

  startProcessing ( store )
  poll ( store, requestInfoForExecutorsStore, undefined, executorStatusOpt, 10000 )
  rs.setS ( initial )
} )





