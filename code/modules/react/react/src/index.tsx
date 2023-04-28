//Copyright (c)2020-2022 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react'
import { CleanConfig } from "@runbook/config";
import { config } from "@runbook/fixtures";
import { createRoot } from "react-dom/client";
import { startProcessing } from "@runbook/store";
import { getElement } from "./react.helpers";
import { FullState, refAndDataOpt, selectionStateOpt } from "./fullState";
import { DisplayRsInState, makeStore } from "./makeStore";
import { bootStrapCombine, bootstrapMenu, changeMode, findMenuAndDisplay, MenuAndDisplayFnsForRunbook, MenuDefn, MenuDefnForRunbook, SelectionState } from "@runbook/menu_react";
import { Optional } from "@runbook/optics";
import { display, displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent } from "@runbook/runbook_state";
import { displayScriptInstrument } from "@runbook/instruments_react";
import { displayView } from "@runbook/views_react";


export function menuDefn<S> ( display: ( name: string ) => ( path: string[] ) => RunbookComponent<S, any> ): MenuDefn<RunbookComponent<S, any>> {
  return {
    Ontology: {
      type: 'navBarItem', path: [], display: display ( 'ontology' ),
      children: {
        Mereologies: { type: 'dropdownItem', path: [ 'mereology' ], display: display ( 'mereology item' ), },
        "Reference Data": { type: 'dropdownItem', path: [ 'reference' ], display: display ( 'reference item' ), },
        "Inheritances": { type: 'dropdownItem', path: [ 'inheritance' ], display: display ( 'inheritance item' ), }
      }
    },
    Instruments: { type: 'navBarItem', from: { type: 'dropdownItem', path: [ 'instrument' ], display: path => displayScriptInstrument<S> () } },
    Views: { type: 'navBarItem', from: { type: 'dropdownItem', path: [ 'view' ], display: path => displayView<S> ( path[ path.length - 1 ] ) } },
  }
}

export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( name: string ) => ( path: string[] ): RunbookComponent<S, any> =>
  st => props => <div><h1> {name} {path.join ( '.' )} - {modeFromProps ( props )}</h1>
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'view' ) )}
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'edit' ) )}
    {jsonMe ( st )}</div>;


const menuFns: MenuAndDisplayFnsForRunbook<FullState, any> = bootstrapMenu<FullState, any> ()
const md: MenuDefnForRunbook<FullState> = menuDefn ( fixtureDisplayWithMode<FullState> ( selectionStateOpt ) )


export const displayRsForMenuDefn: DisplayRsInState<FullState, CleanConfig> =
               rs => {
                 return <div>{display ( rs, { mode: 'view' }, findMenuAndDisplay<FullState, CleanConfig> ( 'nav', menuFns, md, bootStrapCombine ) )}</div>;
               }


let initial: FullState = { config: config as CleanConfig, selectionState: { menuPath: [ 'situation' ] } };
let rootElement = getElement ( "root" );
const root = createRoot ( rootElement )

const { store, rs } = makeStore<FullState, CleanConfig> ( root, initial, refAndDataOpt, displayRsForMenuDefn );

startProcessing ( store )
rs.setS ( initial )




