import { applyMenuDefn, MenuDefnFns, MenuFn } from "./menu";
import { menuDefn, sampleDisplay } from "./menu.fixture";
import { flatMap, indentAll, safeArray } from "@runbook/utils";


function toString ( prefix: string ): MenuFn<string[]> {
  return ( menuPath, path, name, children ) =>
    [ `${prefix} [${menuPath}] ${name} [${path?.join ( '.' )}]`, ...flatMap ( safeArray ( children ), indentAll ) ]
}

const demoMenuDefnFn: MenuDefnFns<string[]> = {
  navBar: toString ( 'navBar' ),
  navBarItem: toString ( 'navBarItem' ),
  dropdownItem: toString ( 'dropdownItem' ),
}

describe ( "applyMenuDefn", () => {
  it ( "should apply menuDefn to menu and data", () => {
    expect ( applyMenuDefn<string[]> ( 'nav', demoMenuDefnFn, menuDefn<string[]> ( () => () => [] ), sampleDisplay ) ).toEqual ( [] )
  } )
} )
