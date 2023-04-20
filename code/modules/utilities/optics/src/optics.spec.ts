import { identity, iso2 } from "./iso";
import { focusQuery } from "./focuson";
import { Optional } from "./optional";
import { getOptional, multiplyOpt, multiplyOptInto } from "./getter";
import { setOptional } from "./setter";

interface TestForOpticsABC {
  a?: TestForOpticsBC
  d?: string
}
interface TestForOpticsBC {
  b?: { c?: string }
}
let optId = identity<TestForOpticsABC> ();
let optA = focusQuery ( optId, 'a' );
let optB = focusQuery ( optA, 'b' );
let optC = focusQuery ( optB, 'c' );
let optD = focusQuery ( optId, 'd' );

const ad: Optional<TestForOpticsABC, [ TestForOpticsBC, string ]> = multiplyOpt ( optA, optD )
const iso12 = iso2<string, string, OneTwoForTest> (
  ( one, two ) =>
    ({ one, two }),
  ( { one, two } ) =>
    [ one, two ] )

let hello: TestForOpticsABC = { a: { b: { c: "hello" } }, d: "two" };
let goodbye: TestForOpticsABC = { a: { b: { c: "goodbye" } }, d: "two" };
describe ( "optics messing with ? and focusQuery", () => {
  it ( "should compile and have a get, set", () => {
    expect ( getOptional ( optC, hello ) ).toEqual ( "hello" )
    expect ( setOptional ( optC, hello, "goodbye" ) ).toEqual ( { a: { b: { c: "goodbye" } }, "d": "two" } )
  } )
} )

interface OneTwoForTest {
  one?: string
  two?: string
}

describe ( "iso2 - from two items to one", () => {
  it ( 'should ', function () {
    expect ( iso12.get ( [ "one", "two" ] ) ).toEqual ( { one: "one", two: "two" } )
    expect ( iso12.reverseGet ( { one: "one", two: "two" } ) ).toEqual ( [ "one", "two" ] )
  } );
} )
describe ( "composing two lenses (multiply)", () => {
  it ( "should compile and have a get, set", () => {
    expect ( getOptional ( ad, hello ) ).toEqual ( [ { b: { c: "hello" } }, "two" ] )
    expect ( setOptional ( ad, hello, [ { b: { c: "goodbye" } }, "two" ] ) ).toEqual ( { a: { b: { c: "goodbye" } }, d: "two" } )
  } )
  it ( "should multiplyIntoRes", () => {
    const ad: Optional<TestForOpticsABC, OneTwoForTest> = multiplyOptInto ( optC, optD, iso12 )
    let actual = getOptional ( ad, hello );
    expect ( actual ).toEqual ( { one: "hello", two: "two" } )
    expect ( setOptional ( ad, hello, { one: "goodbye", two: "two" } ) ).toEqual ( { a: { b: { c: "goodbye" } }, d: "two" } )
  } )
} )

