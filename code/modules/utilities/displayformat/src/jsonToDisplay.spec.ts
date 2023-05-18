import { jsonToDisplay } from "./jsonToDisplay";


let rawJsonObject = { a: 1, b: 2, c: 3 };
let rawJsonArray = [ { a: 1 }, { b: 2 }, { c: 3 } ];
describe ( "jsonToDisplay", () => {
  describe ( "jsonToDisplay - array", () => {
    it ( "should display json as 'JSON.stringify(..,null,2)", () => {
      expect ( jsonToDisplay ( rawJsonArray, 'json' ) ).toEqual ( JSON.stringify ( rawJsonArray, null, 2 ) )
    } )

    it ( "should display onelinejson as 'JSON.stringify(..)", () => {
      expect ( jsonToDisplay ( rawJsonArray, 'onelinejson' ) ).toEqual ( JSON.stringify ( rawJsonArray ) )
    } )
    it ( "should display oneperlinejson as a set of lines, one object per line", () => {
      expect ( jsonToDisplay ( rawJsonArray, 'oneperlinejson' ) ).toEqual ( `{"a":1}
{"b":2}
{"c":3}` )
    } )
  } )
  describe ( "jsonToDisplay - object", () => {
    it ( "should display json as 'JSON.stringify(..,null,2)", () => {
      expect ( jsonToDisplay ( rawJsonObject, 'json' ) ).toEqual ( JSON.stringify ( rawJsonObject, null, 2 ) )
    } )

    it ( "should display onelinejson as 'JSON.stringify(..)", () => {
      expect ( jsonToDisplay ( rawJsonObject, 'onelinejson' ) ).toEqual ( JSON.stringify ( rawJsonObject ) )
    } )
    it ( "should display oneperlinejson as a set of lines, one object per line", () => {
      expect ( jsonToDisplay ( rawJsonObject, 'oneperlinejson' ) ).toEqual ( `{"a":1,"b":2,"c":3}` )
    } )
  } )
  describe ( 'primitives', () => {
    it ( "should display exitcode==0 as 'true' or 'false'", () => {
      expect ( jsonToDisplay ( true, 'exitcode==0' ) ).toEqual ( 'true' )
      expect ( jsonToDisplay ( false, 'exitcode==0' ) ).toEqual ( 'false' )
    } )
    it ( "should display exitcode as a number turned into a string", () => {
      expect ( jsonToDisplay ( 0, 'exitcode' ) ).toEqual ( '0' )
      expect ( jsonToDisplay ( 123, 'exitcode' ) ).toEqual ( '123' )
    } )

  } )
} )