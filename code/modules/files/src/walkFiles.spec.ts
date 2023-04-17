import { findDirectoryHoldingFileOrThrow, readExpected, readTestFile } from "./files";
import path from "path";
import { walkDirectory } from "./walkFiles";
import fs from "fs";
import { cleanLineEndings, deepCombineTwoObjects, ErrorsAnd, isErrors, mapErrors, toErrorsAnd } from "@runbook/utils";

export const codeRootDir = findDirectoryHoldingFileOrThrow ( process.cwd (), "laoban.json" );
export const testRoot = path.resolve ( codeRootDir, '..', 'tests', 'walkDirectories' );

describe ( 'walkDirectory', () => {
  it ( "should find all files in a directory", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    let files: string[] = await walkDirectory ( testDir );
    expect ( files.map ( f => path.relative ( testDir, f ).replace ( /\\/g, '/' ) ) ).toEqual ( [
      "inheritance/environment.inheritance.json",
      "inheritance/service.inheritance.json",
      "instruments/echo.instrument.json",
      "instruments/git/cloneOrFetch.instrument.json",
      "instruments/ls.instrument.json",
      "mereology/main.mereology.json",
      "reference/environment.json",
      "views/debug/displayGit.view.json",
      "views/debug/domain.view.json"
    ] )
  } )

} )

export async function mergeJsonFiles ( dir: string ): Promise<ErrorsAnd<any>> {
  let files = await walkDirectory ( dir );
  let loaded: Promise<ErrorsAnd<any>>[] = files.filter ( f => f.endsWith ( '.json' ) ).map ( async f => {
    const json = await fs.promises.readFile ( f, 'utf8' );
    try {return JSON.parse ( json )} catch ( e ) {
      return { errors: [ `Malformed JSON in ${f}. Error ${e}` ] }
    }
  } )
  let all = await Promise.all ( loaded );
  return mapErrors ( toErrorsAnd ( all ),
    all => all.reduce ( deepCombineTwoObjects, {} ) )
}
describe ( "mergeJsonFiles", () => {
  it ( "should merge the data in all the json files-happy", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    let value = await mergeJsonFiles ( testDir );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ) )
      .toEqual ( readTestFile ( testRoot, "happy.merged.json" ) )
  } )
  it ( "should report errors", async () => {
    const testDir = path.resolve ( testRoot, 'malformed' );
    let value = await mergeJsonFiles ( testDir );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ).replace ( /\\/g, '/' ) )
      .toEqual ( readTestFile ( testRoot, "malformed.merged.json" ) )
  } )
} )
