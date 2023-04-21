import { jsonMe, RunbookComponent } from "@runbook/utilities_react";
import { NameAndDisplayGroupAndItem } from "./displayFn";

export const sampleDisplay = {
  instruments: { 'I1': { name: 'inst 1' }, 'I2': { name: 'inst 2' }, 'I3': { name: 'inst 3' } },
  views: { 'V1': { name: 'view 1' }, 'V2': { name: 'view 2' }, 'V3': { name: 'view 3' } },
  ontology: {
    mereology: { env: [ 'service', 'database' ] },
    reference: { env: { prod: 'production', dev: 'development' } },
    inheritance: { animals: [ 'cat', 'dog' ] }
  }
};

function display ( typeName: string ): RunbookComponent<any> {
  return st => props => <div><h1>{typeName}</h1>{jsonMe ( st )}</div>
}
export const sampleDisplayFn: NameAndDisplayGroupAndItem = {
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