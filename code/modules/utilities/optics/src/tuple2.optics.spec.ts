import { identity } from "./iso";
import { focusOn } from "./focuson";
import { getOptional } from "./getter";
import { setOptional } from "./setter";
import { focusBOn2, focusOnJustA2, focusOnJustB2, optionalForTuple2 } from "./tuple2.optics";

interface TupleOpticsState {
  something: string
  data: { a: number, b: { c: number } }
}
const state: TupleOpticsState = {
  something: 'someString',
  data: { a: 1, b: { c: 3 } }
}

const idO = identity<TupleOpticsState> ()
const aOpt = focusOn ( idO, 'something' )
const dataO = focusOn ( idO, 'data' )

const aO = focusOn ( dataO, 'a' )
const bO = focusOn ( dataO, 'b' )
const cO = focusOn ( bO, 'c' )

describe ( "Optics for Tuple2", () => {
  it ( "should be constructable", () => {
    const tOpt = optionalForTuple2 ( aOpt, aO )
    expect ( getOptional ( tOpt, state ) ).toEqual ( { a: 'someString', b: 1 } )
    expect ( setOptional ( tOpt, state, { a: 'someOthertring', b: 2 } ) ).toEqual ( { something: 'someOthertring', data: { a: 2, b: { c: 3 } } } )
  } )

  it ( "should allow focusBOn", () => {
    const tOpt = optionalForTuple2 ( aOpt, bO )
    const cOpt = focusBOn2 ( tOpt, 'c' )
    expect ( getOptional ( cOpt, state ) ).toEqual ( { a: 'someString', b: 3 } )
    expect ( setOptional ( cOpt, state, { a: 'someOtherString', b: 7 } ) ).toEqual ( { something: 'someOtherString', data: { a: 1, b: { c: 7 } } } )
  } )
  it ( "should allow us to focusOnJustA", () => {
    const refBopt = optionalForTuple2 ( aOpt, bO )
    const optR = focusOnJustA2 ( refBopt )
    expect ( getOptional ( optR, state ) ).toEqual ( 'someString' )
    expect ( setOptional ( optR, state, 'someOtherString' ) ).toEqual ( { something: 'someOtherString', data: { a: 1, b: { c: 3 } } } )
  } )
  it ( "should allow us to focusOnJustB", () => {
    const refBopt = optionalForTuple2 ( aOpt, cO )
    const optD = focusOnJustB2 ( refBopt )
    expect ( getOptional ( optD, state ) ).toEqual ( 3 )
    expect ( setOptional ( optD, state, 9 ) ).toEqual ( { something: 'someString', data: { a: 1, b: { c: 9 } } } )
  } )
} )
