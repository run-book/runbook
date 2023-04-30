import { compareValueForSort, deepSortCondition, getValueDataForSort, zeroValueDepth } from "./condition";
import { mereology } from "@runbook/fixtures";
import { mereologyToSummary } from "@runbook/mereology";

describe ( "getValueDataForSort", () => {
  it ( "should return the value data for a sort - primitives", () => {
    expect ( getValueDataForSort ( "string" ) ).toEqual ( zeroValueDepth )
    expect ( getValueDataForSort ( "{a}" ) ).toEqual ( { ...zeroValueDepth, variables: 1 } )
    expect ( getValueDataForSort ( "{a:ns}" ) ).toEqual ( { ...zeroValueDepth, namespaces: [ "ns" ], variables: 1 } )
    expect ( getValueDataForSort ( 1 ) ).toEqual ( zeroValueDepth )
    expect ( getValueDataForSort ( false ) ).toEqual ( zeroValueDepth )
  } )
  it ( "should work for abc depth 3 and {p} ", () => {
    expect ( getValueDataForSort ( [ "a", { "b": { "c": 3 } } ] ) ).toEqual ( { depth: 5, namespaces: [], variables: 0 } )
    expect ( getValueDataForSort ( [ "{p}", {} ] ) ).toEqual ( { depth: 2, namespaces: [], variables: 1 } )

  } )

  it ( "should return the value data for a sort - object", () => {
    expect ( getValueDataForSort ( { a: { b: { c: 3 } } } ) ).toEqual ( { ...zeroValueDepth, depth: 6 } )
    expect ( getValueDataForSort ( { a: { "{b:nsb}": { c: "{c:nsc}", "{d:nsd}": {} } }, "{e:nse}": "{f:nsf}" } ) ).toEqual (
      {
        "depth": 7,
        "namespaces": [
          "nsb",
          "nsc",
          "nsd",
          "nse",
          "nsf"
        ],
        "variables": 5
      }
    )

  } )
} )


const mereologySummary = mereologyToSummary ( mereology as any )
describe ( "compareValueForSort", () => {
  const oneNs = [ '1' ]
  const twoNs = [ '1', '2' ]
  it ( "should prefer a values with fewer variables", () => {
    expect ( compareValueForSort ( mereologySummary, 'context' ) ( { ...zeroValueDepth, variables: 1 }, { ...zeroValueDepth, variables: 2 } ) ).toBeLessThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) ( { ...zeroValueDepth, variables: 1, namespaces: oneNs }, { ...zeroValueDepth, variables: 2, namespaces: twoNs } ) ).toBeLessThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) ( { ...zeroValueDepth, variables: 1, namespaces: twoNs }, { ...zeroValueDepth, variables: 2, namespaces: oneNs } ) ).toBeLessThan ( 0 )

    expect ( compareValueForSort ( mereologySummary, 'context' ) ( { ...zeroValueDepth, variables: 3 }, { ...zeroValueDepth, variables: 1 } ) ).toBeGreaterThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) ( { ...zeroValueDepth, variables: 3 }, { ...zeroValueDepth, variables: 3 } ) ).toEqual ( 0 )
  } )
  it ( "if the same number of variables it should prefer fewer namespaces", () => {
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 1, namespaces: oneNs },
      { ...zeroValueDepth, variables: 1, namespaces: twoNs } ) ).toBeLessThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 1, namespaces: twoNs },
      { ...zeroValueDepth, variables: 1, namespaces: oneNs } ) ).toBeGreaterThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 1, namespaces: twoNs },
      { ...zeroValueDepth, variables: 1, namespaces: twoNs } ) ).toEqual ( 0 )
  } )
  it ( "if the namespaces are in the mereology, it will prefer the one that is a descendant of the other", () => {
    const serviceNs = [ 'service', 'some', 'other' ]
    const environmentNs = [ 'environment', 'some', 'other' ]
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 10, namespaces: serviceNs },
      { ...zeroValueDepth, variables: 1, namespaces: environmentNs } ) ).toBeLessThan ( 0 )
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 1, namespaces: environmentNs },
      { ...zeroValueDepth, variables: 10, namespaces: serviceNs } ) ).toBeGreaterThan ( 0 )
  } )

  it ( "if the namespaces are in the mereology it's oK if a parent and child are in the same valuedata", () => {
    const ns1 = [ 'service', 'environment', 'other' ]
    const ns2 = [ 'environment', 'some', 'other' ]
    expect ( compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 10, namespaces: ns1 },
      { ...zeroValueDepth, variables: 1, namespaces: ns2 } ) ).toBeLessThan ( 0 )
  } )
  it ( "if the namespaces are in the mereology it will throw an exception if a<b and b<a", () => {
    const ns1 = [ 'service', 'environment', 'other' ]
    const ns2 = [ 'environment', 'service', 'other' ]
    expect ( () => compareValueForSort ( mereologySummary, 'context' ) (
      { ...zeroValueDepth, variables: 10, namespaces: ns1 },
      { ...zeroValueDepth, variables: 1, namespaces: ns2 } ) ).toThrow ( 'context\nHave issue in the mereology. Some of the namespaces are both descendants of each other' )
  } )
} )

describe ( "deepSortCondition", () => {
  let cond = {
    "a": { "b": { "c": 3 } },
    "{p}": {}
  };
  it ( "should sort", () => {
    let entries = Object.entries ( deepSortCondition ( mereologySummary, 'context', cond ) );
    expect ( entries ).toEqual (
      [
        [ "a", { "b": { "c": 3 } } ],
        [ "{p}", {} ],
      ] )
  } )

  it ( "should sort the other way", () => {
    expect ( Object.entries ( deepSortCondition ( mereologySummary, 'context', {
      "{p}": {},
      "a": { "b": { "c": 3 } },
    } ) ) ).toEqual ( [
      [ "a", { "b": { "c": 3 } } ],
      [ "{p}", {} ],
    ] );
  } )
  it ( "should sort service/env situation", () => {
    expect ( Object.entries ( deepSortCondition ( mereologySummary, 'context',
      { "{ser:service}": {}, "env:environment": {} } ) ) ).toEqual ( [
      [ "env:environment", {} ],
      [ "{ser:service}", {} ],
    ] )
  } )
  it ( "should sort service/env situation - other way round", () => {
    expect ( Object.entries ( deepSortCondition ( mereologySummary, 'context',
      { "env:environment": {}, "{ser:service}": {} } ) ) ).toEqual ( [
      [ "env:environment", {} ],
      [ "{ser:service}", {} ],

    ] )
  } )

} )
