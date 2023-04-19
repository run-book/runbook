import { validateMereology } from "./mereology";
import { mereology, ref } from "@runbook/fixtures";
import { fromReferenceData } from "./reference.data";


describe ( "validateMereology", () => {
  it ( "should return no issues with the fixture mereology", () => {
    expect ( validateMereology ( 'prefix' ) ( mereology ) ).toEqual ( [] )
  } )
  it ( "should return issues with the data", () => {
    expect ( validateMereology ( 'prefix' ) ( '123' as any ) ).toEqual ( [
      "prefix is of type string and not an array"
    ] )
    expect ( validateMereology ( 'prefix' ) ( { a: 1 } as any ) ).toEqual ( [
      "prefix.a is of type number and not an array"
    ] )
    expect ( validateMereology ( 'prefix' ) ( { a: [ 1 ] } as any ) ).toEqual ( [
      "prefix.a[0] is [1] which is a number and not a string"
    ] )
  } )
} )