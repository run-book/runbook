import { Mereology, mereologyToSummary, validateMereology } from "./mereology";
import { mereology } from "@runbook/fixtures";

const castMerology: Mereology = mereology as any
describe ( "validateMereology", () => {
  it ( "should return no issues with the fixture mereology", () => {
    expect ( validateMereology ( 'prefix' ) ( castMerology ) ).toEqual ( [] )
  } )
  it ( "should return issues with the data", () => {
    expect ( validateMereology ( 'prefix' ) ( '123' as any ) ).toEqual ( [
      "prefix is of type string and not an object"
    ] )
    expect ( validateMereology ( 'prefix' ) ( { a: 1 } as any ) ).toEqual ( [
      "prefix.a is [1] which is a number and not a object",
      "prefix.a does not have children as it is of type number and not an object",
      "prefix.a does not have fields as it is of type number and not an object"
    ] )
    expect ( validateMereology ( 'prefix' ) ( { a: [ 1 ] } as any ) ).toEqual ( [
      "prefix.a is an array"
    ] )
  } )
} )

describe ( "mereologyToSummary", () => {
  it ( "should be makable from ref", () => {
    expect ( mereologyToSummary ( castMerology ) ).toEqual ( {
      "environment": [ "service", "database" ],
      "service": [],
      "database": [],
    } )
  } )
} )