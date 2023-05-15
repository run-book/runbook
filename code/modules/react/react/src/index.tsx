//Copyright (c)2020-2022 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react'
import { CleanConfig } from "@runbook/config";

import { createRoot } from "react-dom/client";
import { startProcessing } from "@runbook/store";
import { getElement } from "./react.helpers";
import { fetchCommandsOpt, FullState, refAndDataOpt, selectionStateOpt } from "./fullState";
import { DisplayRsInState, makeStore } from "./makeStore";
import { bootStrapCombine, bootstrapMenu, changeMode, findMenuAndDisplay, MenuAndDisplayFnsForRunbook, MenuDefn, MenuDefnForRunbook, SelectionState } from "@runbook/menu_react";
import { identity, Optional } from "@runbook/optics";
import { display, displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent } from "@runbook/runbook_state";
import { displayScriptInstrument } from "@runbook/instruments_react";
import { displayView } from "@runbook/views_react";
import { DisplayMereologyContext, runbookCompAllDataFor } from "@runbook/referencedata_react";
import { BindingContext } from "@runbook/bindings";
import { mereologyToSummary } from "@runbook/mereology";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom, last, makeStringDag, NameAnd, prune } from "@runbook/utils";
import { tableProps } from "@runbook/bindings_react";
import { FetchCommand } from "@runbook/commands";
import { displayExecutors } from "@runbook/executors_react";
import { pollStore } from "@runbook/commands/dist/src/poll";
import { StatusEndpointData } from "@runbook/executors";


const executorsStore = pollStore ( {},
  window.location.href + 'executeStatus', undefined,
  identity<NameAnd<StatusEndpointData>> (), fetch, 1000 );
export function menuDefn<S> ( fetchCommandOpt: Optional<S, FetchCommand[]>, display: ( name: string ) => ( path: string[] ) => RunbookComponent<S, any>, dispRefData: ( path: string[] ) => RunbookComponent<S, any> ): MenuDefn<RunbookComponent<S, any>> {
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
    Instruments: { type: 'navBarItem', from: { type: 'dropdownItem', path: [ 'instrument' ], display: path => displayScriptInstrument<S> ( fetchCommandOpt, last ( path ) ) } },
    Views: { type: 'navBarItem', from: { type: 'dropdownItem', path: [ 'view' ], display: path => displayView<S> ( path[ path.length - 1 ] ) } },
    Status: {
      type: 'navBarItem', path: [ 'status' ], display: display ( 'status' ),
      children: {
        "Executors": { type: 'dropdownItem', path: [ 'status', 'executor' ], display: path => displayExecutors ( executorsStore ), },
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


const md = ( config: CleanConfig ): MenuDefnForRunbook<FullState> =>
  menuDefn ( fetchCommandsOpt, fixtureDisplayWithMode<FullState> ( selectionStateOpt ), runbookCompAllDataFor ( dispMContext ( config ) ) )


export const displayRsForMenuDefn: DisplayRsInState<FullState, CleanConfig> =
               rs => {
                 return <div>{display ( rs, { mode: 'view' }, findMenuAndDisplay<FullState, CleanConfig> ( 'nav', menuFns, md, bootStrapCombine ) )}</div>;
               }


const loc = window.location.href
const filename = loc + 'config'
console.log ( 'loc: ', loc, 'filename: ', filename );
const rootElement = getElement ( "root" );
fetch ( filename ).then ( response => response.json () ).then ( config => {
  const realConfig = prune ( config, '__from' )
  let initial: FullState = { config: realConfig as any, selectionState: { menuPath: [ 'situation' ] }, fetchCommands: [] , status: {executor:{}}};
  const root = createRoot ( rootElement )
  const { store, rs } =
          makeStore<FullState, CleanConfig> ( root, initial, refAndDataOpt, fetchCommandsOpt, displayRsForMenuDefn );

  startProcessing ( store )
  rs.setS ( initial )
} )





