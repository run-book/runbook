import { NameAnd } from "@runbook/utils";
import { MenuDefn, SelectionState } from "./navigation";
import { displayWithNewOpt, jsonMe, modeFromProps, RunbookComponent } from "@runbook/runbook_state";
import { Optional } from "@runbook/optics";
import { changeMode } from "./changeMode";


export function fixtureDisplayWithoutMode<S> ( typeName: string ): RunbookComponent<S, any> {
  return st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>{jsonMe ( st )}</div>
}

export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( typeName: string ): RunbookComponent<S, any> =>
  st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'view' ) )}
    {displayWithNewOpt ( st, props, opt, changeMode<S> ( 'edit' ) )}
    {jsonMe ( st )}</div>;


export const sampleDisplay: NameAnd<any> = {
  instruments: { 'I1': { name: 'inst 1' }, 'I2': { name: 'inst 2' }, 'I3': { name: 'inst 3' } },
  views: { 'V1': { name: 'view 1' }, 'V2': { name: 'view 2' }, 'V3': { name: 'view 3' } },

  //Note that there is no ontology: these are at the root level
  mereology: { env: [ 'service', 'database' ] },
  reference: { env: { prod: 'production', dev: 'development' } },
  inheritance: { animals: [ 'cat', 'dog' ] }
};


export function menuDefn<R> ( display: ( name: string ) => ( path: string[] ) => R ): MenuDefn<R> {
  return [
    {
      type: 'navBarItem', name: 'Ontology', path: [], display: display ( 'ontology' ),
      children: [
        { type: 'dropdownItem', name: 'Mereologies', path: [ 'mereology' ], display: display ( 'mereology item' ), },
        { type: 'dropdownItem', name: 'Reference Data', path: [ 'reference' ], display: display ( 'reference item' ), },
        { type: 'dropdownItem', name: 'Inheritancies', path: [ 'inheritance' ], display: display ( 'inheritance item' ), }
      ]
    },
    { type: 'navBarItem', name: 'Instruments', from: { type: 'dropdownItem', path: [ 'instruments' ], display: display ( 'instrument item' ) } },
    { type: 'navBarItem', name: 'Views', from: { type: 'dropdownItem', path: [ 'views' ], display: display ( 'view item' ) } } ]
}

