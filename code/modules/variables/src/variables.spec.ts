//Copyright (c)2020-2023 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
import { derefence, dollarsBracesVarDefn, mustachesVariableDefn } from "./variables";

describe ( "derefence", () => {
  describe ( "simple variables like ${a}", () => {
    it ( "If the string has ${a} in it, then that is replaced by the dic entry", () => {
      const dic = { a: "A", b: { c: "BC" } }
      expect ( derefence ( 'context', dic, "a", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'a' )
      expect ( derefence ( 'context', dic, "b.c", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'b.c' )
      expect ( derefence ( 'context', dic, "Some data ${a} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Some data A here' )
      expect ( derefence ( 'context', dic, "Some data ${b.c} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Some data BC here' )
      expect ( derefence ( 'context', dic, "Some data ${d} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( "Some data //LAOBAN-UPDATE-ERROR context. ${d} is undefined here" )
    } )
    it ( "should ignore leading trailing spaces", () => {
      const dic = { a: "A", b: { c: "BC" } }
      expect ( derefence ( 'context', dic, "Some data ${  a  } here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( "Some data A here" )
    } )
    it ( "should handle ${} without emptyTemplateReturnsSelf", () => {
      const dic = { a: "A", b: { c: "BC" } }
      expect ( derefence ( 'context', dic, "Some data ${} here", { variableDefn: dollarsBracesVarDefn, allowUndefined: true } ) ).toEqual ( "Some data  here" )
    } )
    it ( "should handle ${} with emptyTemplateReturnsSelf", () => {
      const dic = { a: "A", b: { c: "BC" } }
      expect ( derefence ( 'context', dic, "Some data ${} here", { variableDefn: dollarsBracesVarDefn, allowUndefined: true, emptyTemplateReturnsSelf: true } ) ).toEqual (
        "Some data ${} here" )
    } )


  } )

  describe ( "we should be able to do basic functions on strings", () => {
    const dic = { a: "camelCaseWords", b: "ALLCAPS", c: "lower", d: "snake_case" }
    it ( 'should toSnakeCase()', () => {
      expect ( derefence ( 'context', dic, "${a|toSnakeCase}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'camel_case_words' )

    } )
    it ( 'should toUpperCase()', () => {
      expect ( derefence ( 'context', dic, "${a|toUpperCase}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'CAMELCASEWORDS' )

    } )
    it ( 'should toLowerCase()', () => {
      expect ( derefence ( 'context', dic, "${a|toLowerCase}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'camelcasewords' )

    } )
    it ( 'should toTitleCase()', () => {
      expect ( derefence ( 'context', dic, "${a|toTitleCase}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Camelcasewords' )

    } )
    it ( 'should default(xx) when value defined', () => {
      expect ( derefence ( 'context', dic, "${a|default(defaultValue)}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'camelCaseWords' )
    } )
    it ( 'should default(xx) when value undefined', () => {
      expect ( derefence ( 'context', dic, "${z|default(defaultValue)}", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'defaultValue' )

    } )

  } )


  describe ( "simple variables with indent like ${a:indentx}", () => {
    it ( "If the string has ${a:indentx} in it, then that is replaced by the dic entry", () => {
      const dic = { a: "A", b: { c: "BC" } }
      expect ( derefence ( 'context', dic, "Some data ${a:indent1} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Some data A here' )
      expect ( derefence ( 'context', dic, "Some data ${a:indent2} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Some data A here' )
      expect ( derefence ( 'context', dic, "Some data ${a:indent3} here", { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( 'Some data A here' )
    } )

  } )

  const dic = { a: { 'this': 1, 'item': 2 }, array: [ 'a', 'b', 'c' ] }
  describe ( "variable:object like ${a:object}", () => {
    it ( 'should replace an object with the string w/o {}', () => {
      expect ( derefence ( 'context', dic, '{"one":1,\n${a:object},\n"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual (
        `{"one":1,
"this": 1,
"item": 2,
"two":2}` )
    } )
    it ( 'should report an error if the reference isnt an object', () => {
      expect ( derefence ( 'context', dic, '{"one":1,\n${b:object},\n"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual (
        `{"one":1,
//LAOBAN-UPDATE-ERROR context. \${b:object} is undefined,
"two":2}` )

    } )

  } )
  describe ( "variable:object:indentx like ${a:object:indentx}", () => {
    it ( 'should replace an object with the string w/o {}', () => {
      expect ( derefence ( 'context', dic, '{"one":1,\n${a:object:indent1}\n"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `{"one":1,
 "this": 1,
 "item": 2
"two":2}` )
      expect ( derefence ( 'context', dic, '{"one":1,\n${a:object:indent3}\n"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `{"one":1,
   "this": 1,
   "item": 2
"two":2}` )
    } )
  } )
  describe ( "variable:object:comma like ${a:object:comma}", () => {
    it ( 'should replace an object with the string w/o {}', () => {
      expect ( derefence ( 'context', dic, '{"one":1,${a:object:comma}"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `{"one":1,"this": 1,
"item": 2,"two":2}` )
    } )
  } )

  describe ( "variable:object:comma:indentx like ${a:object:comma:indentx}", () => {
    it ( 'should replace an object with the string w/o {}', () => {
      expect ( derefence ( 'context', dic, '{"one":1,${a:object:comma:indent3}"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `{"one":1,   "this": 1,
   "item": 2,"two":2}` )
    } )
  } )
  describe ( "variable:object:comma:indentx like ${a:object:indentx} for an array", () => {
    it ( 'should replace an object with the string w/o {}', () => {
      const withArray = { ...dic, a: [ 'V1', 'V2' ] }
      expect ( derefence ( 'context', withArray, '{"one":1,[${a:object:indent3}],"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `{"one":1,[   "V1",
   "V2"],"two":2}` )
    } )
  } )


  describe ( "We should be able to process  {${projectDetails.guards.links:map<<>>(i=>\"<<i>>\":\"<<version>>\")}}", () => {
    it ( 'should inline the mapped array', () => {
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' },
        '{"one":1, ${array:map<<>>(i=>"<<i>>":"<<version>>")},"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual (
        '{"one":1, "a":"1.2.3","b":"1.2.3","c":"1.2.3","two":2}' )
    } )
  } )
  describe ( "We should be able to process  {${projectDetails.guards.links:comma:map<<>>(i=>\"<<i>>\":\"<<version>>\")}}", () => {
    it ( "should only add a comma if the array is not empty", () => {
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' },
        '{"one":1, ${array:comma:map<<>>(i=>"<<i>>":"<<version>>")}"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual (
        '{"one":1, "a":"1.2.3","b":"1.2.3","c":"1.2.3","two":2}' )
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' },
        '{"one":1, ${nothingPresent:comma:map<<>>(i=>"<<i>>":"<<version>>")}"two":2}', { variableDefn: dollarsBracesVarDefn } ) ).toEqual (
        '{"one":1, "two":2}' )
    } )
  } )

  describe ( "${compose()}", () => {
    it ( "should compose the values - just one value which is object", () => {
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${compose(a:object:comma)}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `"this": 1,
"item": 2,` )
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${compose(a:object)}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `"this": 1,
"item": 2` )
    } )
    it ( "should compose the values - just one value which is array", () => {
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${compose(array:map<<>>(i=>"<<i>>":"<<version>>"))}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( '"a":"1.2.3","b":"1.2.3","c":"1.2.3"' )
    } )
    it ( "should compose the values object and array", () => {
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${compose(array:map<<>>(i=>"<<i>>":"<<version>>"),a:object)}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `"a":"1.2.3","b":"1.2.3","c":"1.2.3","this": 1,
"item": 2` )
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${compose(  array:map<<>>(i=>"<<i>>":"<<version>>") ,\n  a:object )}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `"a":"1.2.3","b":"1.2.3","c":"1.2.3","this": 1,
"item": 2` )
      expect ( derefence ( 'context', { ...dic, version: '1.2.3' }, '${composeWithCommaIfNeeded(array:map<<>>(i=>"<<i>>":"<<version>>"),a:object)}',
        { variableDefn: dollarsBracesVarDefn } ) ).toEqual ( `"a":"1.2.3","b":"1.2.3","c":"1.2.3","this": 1,
"item": 2,` )
    } )
  } )

} )

describe ( 'derefernence with variableDefn:mustachesVariableDefn', () => {
  const dic = { a: 1 }
  it ( 'should replace a variable with the value', () => {
    expect ( derefence ( 'someContext', dic, 'Hello {{a}}', { variableDefn: mustachesVariableDefn } ) ).toEqual ( 'Hello 1' )
  } )
} )


