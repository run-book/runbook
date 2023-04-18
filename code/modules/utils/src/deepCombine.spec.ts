import { deepCombineTwoObjects } from "./combine";

describe ( 'level1CombineTwoObjects', () => {
    it ( 'should combine two objects - shallow only', () => {
      expect ( deepCombineTwoObjects ( { a: 1 }, { b: 2, x: { q: 1 } } ) ).toEqual (
        { "a": 1, "b": 2, "x": { "q": 1 } } )
      expect ( deepCombineTwoObjects ( { a: 1, b: 2 }, { b: 3 } ) ).toEqual ( { a: 1, b: 3 } )
    } )
    it ( 'should combine two objects - deeper', () => {
      expect ( deepCombineTwoObjects ( { a: { b: 1, c: 2 } }, { p: 2, a: { b: 2, d: 3 } } ) ).toEqual ( {
        "a": { "b": 2, "c": 2, "d": 3 },
        "p": 2
      } )
    } )
    it ( "should combine objects by appending arrays", () => {
      expect ( deepCombineTwoObjects ( { a: [ 1, 2 ] }, { a: [ 3, 4 ] } ) ).toEqual ( { a: [ 1, 2, 3, 4 ] } )
      expect ( deepCombineTwoObjects ( { a: { b: [ 1, 2 ] } }, { a: { b: [ 3, 4 ] } } ) ).toEqual ( {
        "a": { "b": [ 1, 2, 3, 4 ] }
      } )
    } )

  }
)