import { DisplayComponent, displayFnFromNameAnd } from "@runbook/navigation_react/dist/src/displayFn";
import { FullState, selectionStateOpt } from "./fullState";
import { displayScriptInstrument } from "@runbook/instruments_react";
import { information } from "@runbook/components/dist/src/information";
import { displayView } from "@runbook/views_react";
import { display, displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { RefAndData } from "@runbook/utils";
import { displayAndNav, SelectionState } from "@runbook/navigation_react/dist/src/displayAndNav";
import { CleanConfig } from "@runbook/config";
import { config } from "@runbook/fixtures";
import { NavigationContext } from "@runbook/navigation_react";
import { DisplayContext } from "@runbook/navigation_react/dist/src/displayOnDemand";
import { Optional } from "@runbook/optics";
import { changeMode } from "@runbook/navigation_react/dist/src/changeMode";
import * as React from "react";
export const x = 1
// export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( typeName: string ): RunbookComponent<S, any> =>
//   st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>
//     {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'view' ) )}
//     {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'edit' ) )}
//     {jsonMe ( st )}</div>;
// const displayStructure: DisplayComponent<FullState> = {
//   instrument: {
//     __item: displayScriptInstrument (),
//     __group: information ( "Instruments", `Instruments are the basic components that 'get something'.
//     Typically they are a bash script or a javascript component that returns either a column of data or javascript.
//
//     On their own they are not very useful, but they can be combined into views that show the data in a useful way.
//     ` )
//   },
//   view: {
//     __item: displayView ( 'someName' ),
//     __edit: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Edit' ),
//     __group: information ( 'Views', `Views are a way of combining instruments into a useful display.
//
//    Often they will 'go get something'  and then when found will 'go get something else'
//
//
//
//     ` )
//   },
//   mereology: {
//     __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Mereology' ),
//     __group: information ( "Mereology", `The Mereology is where we define the 'is part of relations'. For example a service is part of an environment, but this
//     relationship is not the same as inheritance as 'a service is not a type of environment'.` ),
//   },
//   inheritance: {
//     __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Inheritance' ),
//     __group: information ( "Inheritance", `The inheritance is where we define the 'is a type of' relations.
//      For example a service called 'findPostcode' ISA service.` )
//   },
//   reference: {
//     __item: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Reference' ),
//     __group: information ( "Reference", `The reference is where we record information like the domain and url of services in various environments` )
//   },
//   ontology: {
//     __group: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Ontology' ),
//     inheritance: fixtureDisplayWithMode ( selectionStateOpt ) ( 'Inheritance' )
//   }
// }
// //  ( path: string[], name: string, t: T ) => boolean
// let displayFn: ( parentPath: string[], item: string, mode: string, obj: any ) => (RunbookComponent<FullState, any> | undefined) =
//       displayFnFromNameAnd ( displayStructure, st => props => jsonMe ( st ) );
// const nc: NavigationContext<FullState> = {
//   displayInNav: ( path, t ) => path.length < 1
// }
// const dc: DisplayContext<FullState> = { displayFn }
// export function displayTheRs ( newRs: RunbookState<FullState, RefAndData<SelectionState, CleanConfig>> ) {
//   return display ( newRs, { id: 'root', mode: 'view', focusedOn: config }, displayAndNav<FullState> ( nc, dc ) );
// }