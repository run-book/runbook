import { jsonMe, modeFromProps, RunbookComponent } from "@runbook/utilities_react";
import { displayFnFromNameAnd, NameAndDisplayGroupAndItem } from "./displayFn";
import { DisplayContext } from "./displayOnDemand";
import { NavigationContext } from "./navigation";
import { DisplayAndNavReference } from "./displayAndNav";

export const sampleDisplay = {
  instruments: { 'I1': { name: 'inst 1' }, 'I2': { name: 'inst 2' }, 'I3': { name: 'inst 3' } },
  views: { 'V1': { name: 'view 1' }, 'V2': { name: 'view 2' }, 'V3': { name: 'view 3' } },
  ontology: {
    mereology: { env: [ 'service', 'database' ] },
    reference: { env: { prod: 'production', dev: 'development' } },
    inheritance: { animals: [ 'cat', 'dog' ] }
  }
};

function display<S> ( typeName: string ): RunbookComponent<S, any> {
  return st => props => <div><h1>{typeName} - {modeFromProps ( props )}</h1>{jsonMe ( st )}</div>
}
export function sampleDisplayFn<S> (): NameAndDisplayGroupAndItem<S> {
  return {
    instruments: {
      __item: display ( 'Instrument' )
    },
    views: {
      __item: display ( 'View' ),
      __group: display ( 'Views' )
    },
    ontology: {
      __group: display ( 'Ontology' ),
      mereology: display ( 'Mereology' ),
      reference: display ( 'Reference' ),
      inheritance: display ( 'Inheritance' )
    }
  }
}

export const fixtureDisplayContext = <S extends any> (): DisplayContext<S> => {
  return {
    displayFn: displayFnFromNameAnd ( sampleDisplayFn (), st => props => jsonMe ( st ) )
  }
}


export const fixtureNavContext = <S extends any> (): NavigationContext<S> => ({
  displayInNav: ( path, t ) => true
})
