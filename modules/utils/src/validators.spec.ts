import { composeNameAndValidators, orValidators, validateChild, validateChildNumber, validateChildString, validateChildValue, validateNameAnd, validateNumber, validateString, validateValue } from "./validators";
import { NameAnd } from "./nameAnd";

const data = {
  a: 1,
  b: { c: 2, d: "three" },
  c: "Cee"
}
type Data = typeof data

describe ( "validators", () => {
  describe ( "primitives", () => {
    it ( "validateNumber should validate a number", () => {
      expect ( validateNumber () ( "test" ) ( 1 ) ).toEqual ( [] );
      expect ( validateNumber () ( "test" ) ( "1" as any ) ).toEqual ( [ 'test is ["1"] which is a string and not a number' ] );
    } )
    it ( "validateString should validate a string", () => {
      expect ( validateString () ( "test" ) ( "1" ) ).toEqual ( [] );
      expect ( validateString () ( "test" ) ( 1 as any ) ).toEqual ( [ 'test is [1] which is a number and not a string' ] );
    } )
    it ( "validate value should validate a value", () => {
      const validate = validateValue ( "a", "b" );
      expect ( validate ( "test" ) ( "a" ) ).toEqual ( [] );
      expect ( validate ( "test" ) ( "c" as any ) ).toEqual ( [ "test is [\"c\"] not one of [\"a\",\"b\"]" ] );
    } )
  } )
  describe ( "childAndPrimitive", () => {
    describe ( 'validateChildString', function () {
      expect ( validateChildString<Data, 'c'> ( 'c' ) ( 'prefix' ) ( data ) ).toEqual ( [] )

      expect ( validateChildString<Data, 'a'> ( 'a' ) ( 'prefix' ) ( data ) ).toEqual ( [ 'prefix.a is [1] which is a number and not a string' ] )
      expect ( validateChildString<Data, 'b'> ( 'b' ) ( 'prefix' ) ( data ) ).toEqual ( [
        "prefix.b is [{\"c\":2,\"d\":\"three\"}] which is a object and not a string"
      ] )
      expect ( validateChildString<Data, 'c'> ( 'd' as any ) ( 'prefix' ) ( data ) ).toEqual ( [ "prefix.d is undefined" ] )
    } );
    describe ( 'validateChildNumber', () => {
      expect ( validateChildNumber<Data, 'a'> ( 'a' ) ( 'prefix' ) ( data ) ).toEqual ( [] )
      expect ( validateChildNumber<Data, 'b'> ( 'b' ) ( 'prefix' ) ( data ) ).toEqual ( [
        "prefix.b is [{\"c\":2,\"d\":\"three\"}] which is a object and not a number"
      ] )
    } );
    describe ( 'validateChildValue', () => {
      expect ( validateChildValue<Data, 'a'> ( 'a', 1 ) ( 'prefix' ) ( data ) ).toEqual ( [] )
      expect ( validateChildValue<Data, 'a'> ( 'a', 2 ) ( 'prefix' ) ( data ) ).toEqual ( [ "prefix.a is [1] not one of [2]" ] )
    } )
  } );

  describe ( 'validateChild', () => {
    it ( 'should validate a child', () => {
      const validate = validateChild<Data, 'a'> ( 'a', validateNumber () )
      expect ( validate ( 'prefix' ) ( data ) ).toEqual ( [] )
      expect ( validate ( 'prefix' ) ( { ...data, a: "2" as any } ) ).toEqual ( [ 'prefix.a is ["2"] which is a string and not a number' ] )
    } )
  } )

  describe ( "compose", () => {
    it ( "composeNameAndValidators should compose validators", () => {
      const validate = composeNameAndValidators ( validateChildNumber<Data, 'a'> ( 'a' ), validateChildString<Data, 'c'> ( 'c' ) )
      expect ( validate ( 'prefix' ) ( data ) ).toEqual ( [] )
      expect ( validate ( 'prefix' ) ( { ...data, a: "2" as any } ) ).toEqual ( [ 'prefix.a is ["2"] which is a string and not a number' ] )
      expect ( validate ( 'prefix' ) ( { ...data, c: 2 as any } ) ).toEqual ( [ 'prefix.c is [2] which is a number and not a string' ] )
      expect ( validate ( 'prefix' ) ( {} as any ) ).toEqual ( [
        "prefix.a is undefined",
        "prefix.c is undefined"
      ] )
    } )
    it ( "orValidators should compose validators, no errors if any ok", () => {
      const validate = orValidators ( 'someMsg', validateChildNumber<Data, 'a'> ( 'a' ), validateChildString<Data, 'c'> ( 'c' ) )
      expect ( validate ( 'prefix' ) ( { a: 1 } as any ) ).toEqual ( [] )
      expect ( validate ( 'prefix' ) ( { c: "str" } as any ) ).toEqual ( [] )
      expect ( validate ( 'prefix' ) ( data ) ).toEqual ( [] )

      expect ( validate ( 'prefix' ) ( {} as any ) ).toEqual ( [ "prefix someMsg prefix.a is undefined" ] )
    } )
  } )

  describe ( "nameAd", () => {

    it ( "should add name", () => {
      const validate = validateNameAnd<number> ( validateNumber () )
      expect ( validate ( 'prefix' ) ( { a: 1, b: 2, c: 3 } ) ).toEqual ( [] )
      expect ( validate ( 'prefix' ) ( { a: 1, b: 2, c: "3" as any } ) ).toEqual ( [ 'prefix.c is ["3"] which is a string and not a number' ] )
    } )
  } )


} )


