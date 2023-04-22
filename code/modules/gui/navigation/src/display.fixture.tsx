import { jsonMe, modeFromProps, RunbookComponent, displayWithNewOpt } from "@runbook/utilities_react";
import { DisplayComponent, displayFnFromNameAnd } from "./displayFn";
import { DisplayContext } from "./displayOnDemand";
import { NavigationContext } from "./navigation";
import { changeMode } from "./changeMode";
import { SelectionState } from "./displayAndNav";
import { Optional } from "@runbook/optics";

export const sampleDisplay = {
  instruments: { 'I1': { name: 'inst 1' }, 'I2': { name: 'inst 2' }, 'I3': { name: 'inst 3' } },
  views: { 'V1': { name: 'view 1' }, 'V2': { name: 'view 2' }, 'V3': { name: 'view 3' } },
  ontology: {
    mereology: { env: [ 'service', 'database' ] },
    reference: { env: { prod: 'production', dev: 'development' } },
    inheritance: { animals: [ 'cat', 'dog' ] }
  }
};

export function fixtureDisplayWithoutMode<S> ( typeName: string ): RunbookComponent<S, any> {
  return st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>{jsonMe ( st )}</div>
}

export const fixtureDisplayWithMode = <S extends any> ( opt: Optional<S, SelectionState> ) => ( typeName: string ): RunbookComponent<S, any> =>
  st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>
    {displayWithNewOpt ( changeMode<S> ( 'view' ), opt, st )}
    {displayWithNewOpt ( changeMode<S> ( 'edit' ), opt, st )}
    {jsonMe ( st )}</div>;
export function sampleDisplayFn<S> ( display: ( typeName: string ) => RunbookComponent<S, any> ): DisplayComponent<S> {
  return {
    instruments: {
      __item: display ( 'Instrument' ),
      __edit: display ( 'Edit Instrument' ),
      __run: display ( 'Run Instrument' )
    },
    views: {
      __item: display ( 'View' ),
      __edit: display ( 'Edit' ),
      __group: display ( 'View overview' )
    },
    ontology: {
      __group: display ( 'Ontology' ),
      mereology: display ( 'Mereology' ),
      reference: display ( 'Reference' ),
      inheritance: display ( 'Inheritance' )
    }
  }
}

export const fixtureDisplayContext = <S extends any> ( display: ( typeName: string ) => RunbookComponent<S, any> ): DisplayContext<S> => {
  return {
    displayFn: displayFnFromNameAnd ( sampleDisplayFn ( display ), st => props => jsonMe ( st ) )
  }
}


export const fixtureNavContext = <S extends any> (): NavigationContext<S> => ({
  displayInNav: ( path, t ) => true
})
