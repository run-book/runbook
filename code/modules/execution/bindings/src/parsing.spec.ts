import { parseBracketedString } from "./binding";


const path = [ 'the', 'path' ]
describe ( "parseBracketedString", () => {
  describe ( "legal bracketed strings", () => {
    it ( "{cat}", () => {
      expect ( parseBracketedString ( path, "{cat}" ) ).toEqual ( { "varName": "cat", inheritsFrom: "", optional: false } )
    } )
    it ( "{cat:animal}", () => {
      expect ( parseBracketedString ( path, "{cat:animal}" ) ).toEqual ( { varName: "cat", inheritsFrom: "animal", optional: false } )
    } )
    it ( "{cat?:animal}", () => {
      expect ( parseBracketedString ( path, "{cat?:animal}" ) ).toEqual ( { varName: "cat", inheritsFrom: "animal", optional: true } )
    } )
    it ( "{cat?:}", () => {
      expect ( parseBracketedString ( path, "{cat?:}" ) ).toEqual ( { varName: "cat", inheritsFrom: "", optional: true } )
    } )
  } )
  describe ( "illegal bracketed strings", () => {
    it ( "should throw errors", () => {
      expect ( () => parseBracketedString ( path, "{cat:animal:third}" ) ).toThrow ( "Invalid variable at the,path -- {cat:animal:third}" )
      expect ( () => parseBracketedString ( path, "cat}" ) ).toThrow ( "Invalid variable at the,path -- cat}" )
      expect ( () => parseBracketedString ( path, "{cat" ) ).toThrow ( "Invalid variable at the,path -- {cat" )
    } )
  } )
} )