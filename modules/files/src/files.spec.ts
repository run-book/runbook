import { findDirectoryHoldingFileOrError, findFileInParentsOrError, findInParent } from "./files";
import { isErrors } from "@runbook/utils";
import * as Path from "path";


describe ( "findDirectoryHoldingFileOrError", () => {
  it ( "should find laoban.json", () => {
    const found = findDirectoryHoldingFileOrError ( process.cwd (), "laoban.json" )
    if ( isErrors ( found ) ) throw found;
    expect ( found.endsWith ( "code" ) ).toEqual ( true )
    expect ( findFileInParentsOrError ( found, "laoban.json" ) ).toEqual ( Path.join ( found.toString (), "laoban.json" ) )
  } )

  it ( "should throw if not found", () => {
    expect ( isErrors ( findDirectoryHoldingFileOrError ( process.cwd (), "notfound.njson" ) ) ).toBeTruthy ()
  } )
} )
