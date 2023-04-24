//Copyright (c)2020-2022 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react'
import { display, displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { CleanConfig } from "@runbook/config";
import { config } from "@runbook/fixtures";
import { focusQuery, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { displayAndNav, SelectionState } from "@runbook/navigation_react/dist/src/displayAndNav";
import { NavigationContext } from "@runbook/navigation_react";
import { DisplayContext } from "@runbook/navigation_react/dist/src/displayOnDemand";
import { RefAndData } from "@runbook/utils";
import { render } from "react-dom";
import { changeMode } from "@runbook/navigation_react/dist/src/changeMode";
import { DisplayComponent, displayFnFromNameAnd } from "@runbook/navigation_react/dist/src/displayFn";
import { sampleDisplayComponent } from "@runbook/navigation_react/dist/src/display.fixture";
import { createRoot } from "react-dom/client";
import { addCmd, addListener, FullStore, newStore, startProcessing, Store } from "@runbook/store";
import { displayScriptInstrument } from "@runbook/instruments_react";
import { information } from "@runbook/components/dist/src/information";
import { displayView } from "@runbook/views_react";


export function getElement ( name: string ): HTMLElement {
  let result = document.getElementById ( name );
  if ( result === null ) throw Error ( `Must have an element called ${name}, and can't find it` )
  return result
}


export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( typeName: string ): RunbookComponent<S, any> =>
  st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'view' ) )}
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'edit' ) )}
    {jsonMe ( st )}</div>;

interface FullState {
  config: CleanConfig
  selectionState: SelectionState
}
const idOpt = identity<FullState> ()
const configOpt = focusQuery ( idOpt, 'config' )
const selectionStateOpt = focusQuery ( idOpt, 'selectionState' )
const refAndDataOpt: Optional<FullState, RefAndData<SelectionState, CleanConfig>> = optionalForRefAndData ( selectionStateOpt, configOpt );


const displayStructure: DisplayComponent<FullState> = {
  instrument: {
    __item: displayScriptInstrument (),
    __group: information ( "Instruments", `Instruments are the basic components that 'get something'.
    Typically they are a bash script or a javascript component that returns either a column of data or javascript.
    
    On their own they are not very useful, but they can be combined into views that show the data in a useful way.
    ` )
  },
  view: {
    __item: displayView('someName'),
    __edit: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Edit' ),
    __group: information('Views',`Views are a way of combining instruments into a useful display. 
    
   Often they will 'go get something'  and then when found will 'go get something else'
   
   
    
    `)
  },
  mereology: {
    __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Mereology' ),
    __group: information ( "Mereology", `The Mereology is where we define the 'is part of relations'. For example a service is part of an environment, but this
    relationship is not the same as inheritance as 'a service is not a type of environment'.` ),
  },
  inheritance: {
    __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Inheritance' ),
    __group: information ( "Inheritance", `The inheritance is where we define the 'is a type of' relations. 
     For example a service called 'findPostcode' ISA service.` )
  },
  reference: {
    __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Reference' ),
    __group: information ( "Reference", `The reference is where we record information like the domain and url of services in various environments` )
  },
  ontology: {
    __group: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Ontology' ),
    inheritance: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Inheritance' )
  }
}
//  ( path: string[], name: string, t: T ) => boolean
let displayFn: ( parentPath: string[], item: string, mode: string, obj: any ) => (RunbookComponent<FullState, any> | undefined) =
      displayFnFromNameAnd ( displayStructure, st => props => jsonMe ( st ) );
const nc: NavigationContext<FullState> = {
  displayInNav: ( path, t ) => path.length < 1
}
const dc: DisplayContext<FullState> = { displayFn }

let initial: FullState = { config: config as CleanConfig, selectionState: { selection: [ 'situation' ] } };

const store: Store<FullState> = newStore ( initial, 10 )


const rs = new RunbookState<FullState, RefAndData<SelectionState, CleanConfig>> ( initial, refAndDataOpt,
  s => {
    console.log ( 'addCmd', s )
    addCmd ( store, { set: s, optional: idOpt } );
  } )

addListener ( store, {
  updated: async ( s: FullState ) => {
    console.log ( 'updated', s );
    const newRs = rs.withNewState ( s )
    root.render ( display ( newRs, { id: 'root', mode: 'view', focusedOn: config }, displayAndNav<FullState> ( nc, dc ) ) )
    console.log ( 'and rerendered!' );
  },
  error: async ( s: FullState, e: Error ) => {
    console.log ( 'error', e );
    console.log ( 'state in error was', s )
  }
} )

startProcessing ( store )
let rootElement = getElement ( "root" );
const root = createRoot ( rootElement )
root.render ( display ( rs, { id: 'root', mode: 'view', focusedOn: config }, displayAndNav<FullState> ( nc, dc ) ) )




