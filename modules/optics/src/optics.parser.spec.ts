import { Optional } from "./optional";
import { get, getOptional } from "./getter";
import { opticsParserO } from "./optics.parser";
import { set, setOptional, setOptionalFn } from "./setter";

const a1b2c3 = { a: { b: { c: 3 } } }
type ABC = typeof a1b2c3
const a1barrayc = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 } ] } }
type ABArrayC = typeof a1barrayc

describe ( "opticsParser", () => {
  describe ( 'a.b.c', () => {
    const parsed: Optional<ABC, number> = opticsParserO ( "a.b.c" )
    it ( "should get", () => {
      expect ( getOptional ( parsed, a1b2c3 ) ).toBe ( 3 )
      expect ( get ( parsed, a1b2c3 ) ).toBe ( 3 )
    } )
    it ( "should setOptional", () => {
      expect ( setOptional ( parsed, a1b2c3, 4 ) ).toEqual ( { a: { b: { c: 4 } } } )
    } )
  } )
  describe ( 'a.b[1].c', () => {
    const parsed: Optional<ABArrayC, number> = opticsParserO ( "a.b[1].c" )
    it ( "should get", () => {
      expect ( getOptional ( parsed, a1barrayc ) ).toBe ( 2 )
      expect ( get ( parsed, a1barrayc ) ).toBe ( 2 )
    } )
    it ( "should setOptional", () => {
      expect ( setOptional ( parsed, a1barrayc, 4 ) ).toEqual ( { a: { b: [ { c: 1 }, { c: 4 }, { c: 3 } ] } } )
    } )
  } )
  describe ( 'a.b[append].c', () => {
    const parsed: Optional<ABArrayC, number> = opticsParserO ( "a.b[append].c" )
    it ( "should return undefined", () => {
      expect ( getOptional ( parsed, a1barrayc ) ).toBe ( undefined )
      expect ( get ( parsed, a1barrayc ) ).toBe ( undefined )
    } )
    it ( "should setOptional", () => {
      expect ( setOptionalFn ( parsed ) ( a1barrayc, 4 ) ).toEqual ( { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 } ] } } )
    } )
  } )

} )
