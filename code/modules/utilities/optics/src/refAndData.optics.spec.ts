import { identity } from "./iso";
import { focusOn } from "./focuson";
import { getOptional } from "./getter";
import { setOptional } from "./setter";
import { focusDataOn, focusOnJustData, focusOnJustRef, optionalForRefAndData } from "./refAndData.optics";

interface TupleOpticsState {
  ref: string
  data: { a: number, b: { c: number } }
}
const state: TupleOpticsState = {
  ref: 'someString',
  data: { a: 1, b: { c: 3 } }
}

const idO = identity<TupleOpticsState> ()
const refO = focusOn ( idO, 'ref' )
const dataO = focusOn ( idO, 'data' )
const aO = focusOn ( dataO, 'a' )
const bO = focusOn ( dataO, 'b' )
const cO = focusOn ( bO, 'c' )

describe ( "Optics for ReferenceAnd", () => {
  it ( "should be constructable", () => {
    const refAopt = optionalForRefAndData ( refO, aO )
    expect ( getOptional ( refAopt, state ) ).toEqual ( { ref: 'someString', data: 1 } )
    expect ( setOptional ( refAopt, state, { ref: 'someOthertring', data: 2 } ) ).toEqual ( { ref: 'someOthertring', data: { a: 2, b: { c: 3 } } } )
  } )
  it ( "should allow focusQuery", () => {
    const refBopt = optionalForRefAndData ( refO, bO )
    const refCOpt = focusDataOn ( refBopt, 'c' )
    expect ( getOptional ( refCOpt, state ) ).toEqual ( { ref: 'someString', data: 3 } )
    expect ( setOptional ( refCOpt, state, { ref: 'someOtherString', data: 7 } ) ).toEqual ( { ref: 'someOtherString', data: { a: 1, b: { c: 7 } } } )
  } )
  it ( "should allow us to focusOnJustRef", () => {
    const refBopt = optionalForRefAndData ( refO, bO )
    const optR = focusOnJustRef ( refBopt )
    expect ( getOptional ( optR, state ) ).toEqual ( 'someString' )
    expect ( setOptional ( optR, state, 'someOtherString' ) ).toEqual ( { ref: 'someOtherString', data: { a: 1, b: { c: 3 } } } )
  } )
  it ( "should allow us to focusOnJustData", () => {
    const refBopt = optionalForRefAndData ( refO, cO )
    const optD = focusOnJustData ( refBopt )
    expect ( getOptional ( optD, state ) ).toEqual ( 3 )
    expect ( setOptional ( optD, state, 9 ) ).toEqual ( { ref: 'someString', data: { a: 1, b: { c: 9 } } } )
  } )
} )
