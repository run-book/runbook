import { findDirectoryHoldingFileOrThrow, readExpected, readTestFile } from "./files";
import path from "path";
import { addFromMutator, mergeJsonFiles, validateJsonFiles, walkDirectory } from "./walkFiles";
import fs from "fs";
import { cleanLineEndings, deepCombineTwoObjects, ErrorsAnd, isErrors, mapErrors, toErrorsAnd } from "@runbook/utils";

export const codeRootDir = findDirectoryHoldingFileOrThrow ( process.cwd (), "laoban.json" );
export const testRoot = path.resolve ( codeRootDir, '..', 'tests', 'walkDirectories' );

describe ( 'walkDirectory', () => {
  it ( "should find all files in a directory", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    fs.rmSync ( path.join ( testDir, '.runbook', 'runbook.json' ), { force: true } )
    let files: string[] = await walkDirectory ( testDir );
    expect ( files.map ( f => path.relative ( testDir, f ).replace ( /\\/g, '/' ) ) ).toEqual ( [
      ".runbook/inheritance/environment.inheritance.json",
      ".runbook/inheritance/service.inheritance.json",
      ".runbook/instruments/echo.instrument.json",
      ".runbook/instruments/git/cloneOrFetch.instrument.json",
      ".runbook/instruments/ls.instrument.json",
      ".runbook/mereology/main.mereology.json",
      ".runbook/reference/environment.json",
      ".runbook/views/debug/displayGit.view.json",
      ".runbook/views/debug/domain.view.json",
      "happy.merged.json"
    ] )
  } )

} )

describe ( "addFromMutator", () => {
  it ( "with primitiives", () => {
    expect ( addFromMutator ( "x", "x/theFile", 2 ) ).toEqual ( 2 )
    expect ( addFromMutator ( "x", "x/theFile", true ) ).toEqual ( true )
    expect ( addFromMutator ( "x", "x/theFile", 's' ) ).toEqual ( 's' )

  } )
  it ( "with objects of primitives", () => {
    expect ( addFromMutator ( "x", "x/theFile", { a: 1, b: 2 } ) ).toEqual ( {
      "__from": [
        "theFile"
      ],
      "a": 1,
      "b": 2
    } )
    expect ( addFromMutator ( "x", "x/theFile", { a: 1, b: 2, __from: 'willBeOverwritten' } ) ).toEqual ( { a: 1, b: 2, __from: [ 'theFile' ] } )
  } )
  it ( "with objects of nameAnd", () => {
    expect ( addFromMutator ( "x", "x/theFile", { a: { b: 2 }, c: { d: { e: 3 } } } ) ).toEqual ( {
      "__from": [ "theFile" ],
      "a": {
        "__from": [ "theFile" ],
        "b": 2
      },
      "c": {
        "__from": [ "theFile" ],
        "d": {
          "__from": [ "theFile" ],
          "e": 3
        }
      }
    } )
    expect ( addFromMutator ( "x", "x/theFile", { a: { b: 2, __from: 'willBeOverwritten' } } ) ).toEqual ( {
      "__from": [ "theFile" ],
      "a": {
        "__from": [ "theFile" ],
        "b": 2
      }
    } )
  } )
  it ( "with arrays", () => {
    expect ( addFromMutator ( "x", "x/theFile", [ 1, 2 ] ) ).toEqual ( [ 1, 2 ] )
    expect ( addFromMutator ( "x", "x/theFile", [ 1, 2, { a: { b: { c: 3 } }, __from: 'willBeOverwritten' } ] ) ).toEqual ( [
      1,
      2,
      {
        "__from": [
          "theFile"
        ],
        "a": {
          "__from": [
            "theFile"
          ],
          "b": {
            "__from": [
              "theFile"
            ],
            "c": 3
          }
        }
      }
    ] )
  } )

} )

describe ( "mergeJsonFiles", () => {
  it ( "should merge the data in all the json files-happy path", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    fs.rmSync ( path.join ( testDir, '.runbook', 'runbook.json' ), { force: true } )
    let value = await mergeJsonFiles ( testDir, addFromMutator, f => f.endsWith ( '.json' ) && !f.endsWith ( '.merged.json' ) );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ) )
      .toEqual ( readTestFile ( testDir, "happy.merged.json" ) )
  } )
  it ( "should report errors", async () => {
    const testDir = path.resolve ( testRoot, 'malformed' );
    let value = await mergeJsonFiles ( testDir, addFromMutator, f => f.endsWith ( '.json' ) && !f.endsWith ( '.merged.json' ) );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ).replace ( /\\/g, '/' ) )
      .toEqual ( readTestFile ( testDir, "malformed.merged.json" ) )
  } )
} )

describe ( "validateJsonFiles", () => {
  it ( "should apply the validator to all the json files-happy path", async () => {
    const testDir = path.resolve ( testRoot, 'happy' );
    fs.rmSync ( path.join ( testDir, '.runbook', 'runbook.json' ), { force: true } )
    let value = await validateJsonFiles ( testDir, f => f.endsWith ( '.json' ) && !f.endsWith ( '.merged.json' ),
      ( name ) => json => [ `${name}:${Object.keys ( json )}` ] );
    expect ( cleanLineEndings ( JSON.stringify ( value, null, 2 ) ) )
      .toEqual ( readTestFile ( testRoot, "expected.validator.json" ) )

  } )
} )