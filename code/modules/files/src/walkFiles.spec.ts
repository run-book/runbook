import { findDirectoryHoldingFileOrThrow, readExpected, readTestFile } from "./files";
import path from "path";
import { mergeJsonFiles, walkDirectory } from "./walkFiles";
import fs from "fs";
import { cleanLineEndings, deepCombineTwoObjects, ErrorsAnd, isErrors, mapErrors, toErrorsAnd } from "@runbook/utils";

export const codeRootDir = findDirectoryHoldingFileOrThrow ( process.cwd (), "laoban.json" );
export const testRoot = path.resolve ( codeRootDir, '..', 'tests', 'walkDirectories' );

describe ( 'walkDirectory', () => {
  it ( "should find all files in a directory", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    let files: string[] = await walkDirectory ( testDir );
    expect ( files.map ( f => path.relative ( testDir, f ).replace ( /\\/g, '/' ) ) ).toEqual ( [
      "happy.merged.json",
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


describe ( "mergeJsonFiles", () => {
  it ( "should merge the data in all the json files-happy", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    let value = await mergeJsonFiles ( testDir, f => f.endsWith ( '.json' ) && !f.endsWith ( '.merged.json' ) );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ) )
      .toEqual ( readTestFile ( testDir, "happy.merged.json" ) )
  } )
  it ( "should report errors", async () => {
    const testDir = path.resolve ( testRoot, 'malformed' );
    let value = await mergeJsonFiles ( testDir, f => f.endsWith ( '.json' ) && !f.endsWith ( '.merged.json' ) );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ).replace ( /\\/g, '/' ) )
      .toEqual ( readTestFile ( testDir, "malformed.merged.json" ) )
  } )
} )
