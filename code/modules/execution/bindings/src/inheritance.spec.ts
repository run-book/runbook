import { inheritanceDefn } from "@runbook/fixtures";
import { validateInheritanceDefn } from "./inheritance";



describe ( 'validateInheritance', () => {
  it ( 'should report no issues with the fixture inheritance', () => {
    expect ( validateInheritanceDefn ( 'prefix' ) ( inheritanceDefn ) ).toEqual ( [] )
  } )
  it ( 'should  issues with malformed inheritance', () => {
    expect ( validateInheritanceDefn ( 'prefix' ) ( '123' as any ) ).toEqual ( [
      "prefix is of type string and not an object"
    ] )
    expect ( validateInheritanceDefn ( 'prefix' ) ( { a: 1 } as any ) ).toEqual ( [
      "prefix.a is of type number and not an array"
    ] )
    expect ( validateInheritanceDefn ( 'prefix' ) ( { a: [ 1 ] } as any ) ).toEqual ( [
      "prefix.a[0] is [1] which is a number and not a string"
    ] )
  } )
} )