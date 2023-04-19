import { mapObjValues } from "./nameAnd";
import { prune } from "./prune";

describe ( "prune", () => {
  it ( "should trim things", () => {
    // expect ( prune ( 1, '_-from' ) ).toEqual ( 1 )
    // expect ( prune ( "__from", '_-from' ) ).toEqual ( "__from" )
    expect ( prune ( { a: 1, __from: {}, b: { c: { __from: [] } }, d: [ { __from: 1 }, 1, 2 ] }, '__from' ) ).toEqual (
      { "a": 1, "b": { "c": {} }, "d": [ {}, 1, 2 ] } )
  } )
} )