import { ref } from "@runbook/fixtures";
import { fromReferenceData, validateReferenceData } from "./reference.data";

describe ( "it should get direct objects from the mereology", () => {
  it ( "should find it if in", () => {
    expect ( fromReferenceData ( ref ) ( [], 'service', 'leo' ) ).toEqual ( {
      "git": { "url": "leo.git.url" }
    } )
  } )
  it ( "shouldn't find it if not in", () => {
    expect ( fromReferenceData ( ref ) ( [], 'service', 'notAService' ) ).toEqual ( undefined )
  } )
} )

describe ( "it should merge the data knowledge of the bound things", () => {
  it ( "should find leo in the test environment", () => {
    expect ( fromReferenceData ( ref ) ( [ { namespace: 'environment', value: 'test' } ], 'service', 'leo' ) ).toEqual ( {
      "domain": "test.leo",
      "git": { "url": "leo.git.url" },
      "port": 80
    } )
  } )
} )

describe ( "validateReferenceData", () => {
  it ( "should return no issues with the fixture reference data", () => {
    expect ( validateReferenceData ( 'prefix' ) ( ref ) ).toEqual ( [] )
  } )
  it ( "should be Ok with empty data", () => {
    expect ( validateReferenceData ( 'prefix' ) ( {} ) ).toEqual ( [] )
  } )
  it ( "should return issues with the data", () => {
    expect ( validateReferenceData ( 'prefix' ) ( '123' as any ) ).toEqual ( [
      "prefix does not have direct as it is of type string and not an object",
      "prefix does not have bound as it is of type string and not an object"
    ] )
    expect ( validateReferenceData ( 'prefix' ) ( { direct: 1, bound: 1 } as any ) ).toEqual ( [
      "prefix.direct is of type number and not an array",
      "prefix.bound is of type number and not an array"
    ] )
  } )
} )