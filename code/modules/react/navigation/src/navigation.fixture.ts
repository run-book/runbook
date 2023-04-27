import { NameAnd } from "@runbook/utils";
import { MenuDefn } from "./navigation";

export const sampleDisplay: NameAnd<any> = {
  instruments: { 'I1': { name: 'inst 1' }, 'I2': { name: 'inst 2' }, 'I3': { name: 'inst 3' } },
  views: { 'V1': { name: 'view 1' }, 'V2': { name: 'view 2' }, 'V3': { name: 'view 3' } },

  //Note that there is no ontology: these are at the root level
  mereology: { env: [ 'service', 'database' ] },
  reference: { env: { prod: 'production', dev: 'development' } },
  inheritance: { animals: [ 'cat', 'dog' ] }
};

export const menuDefn: MenuDefn = [
  {
    type: 'navBarItem',
    name: 'Ontology',
    path:[],
    children: [
      { type: 'dropdownItem', name: 'Mereologies', path: [ 'mereology' ] },
      { type: 'dropdownItem', name: 'Reference Data', path: [ 'reference' ] },
      { type: 'dropdownItem', name: 'Inheritancies', path: [ 'inheritance' ] }
    ]
  },
  { type: 'navBarItem', name: 'Instruments', fromNameAndData: 'dropdownItem', path: [ 'instruments' ] },
  { type: 'navBarItem', name: 'Views', fromNameAndData: 'dropdownItem', path: [ 'views' ] } ]


