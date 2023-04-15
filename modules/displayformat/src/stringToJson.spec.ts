import { columnsToDisplay, columnsToJson, findHeaders, stringToJson } from "./stringToJson";
import { TableFormat } from "./displayFormat";

const text = [ "a b c", "1 2 3", "4 5 6", "7 8 9" ]
describe ( "find headers", () => {
  it ( "should find headers when specified", () => {
    let tableFormat: TableFormat = { type: "table", hideHeader: true, hideFooter: true, headers: [ "A", "B", "C" ] };
    expect ( findHeaders ( tableFormat, text ) ).toEqual ( [ "A", "B", "C" ] )
  } )
  it ( "should find headers when ignore headers specified as boolean", () => {
    expect ( findHeaders ( { type: "table", hideHeader: true }, text ) ).toEqual ( [ "a", "b", "c" ] )
  } )
  it ( "should find headers when ignore headers specified as number", () => {
    expect ( findHeaders ( { type: "table", hideHeader: 4 }, text ) ).toEqual ( [ "a", "b", "c" ] )
  } )
  it ( "should find headers when nothing specified", () => {
    expect ( findHeaders ( { type: "table" }, text ) ).toEqual ( [ "1", "2", "3" ] )
  } )
} )


describe ( "get columns to display", () => {
  it ( "should respect hideHeader", () => {
    expect ( columnsToDisplay ( { type: "table", hideHeader: true }, text ) ).toEqual ( [ "1 2 3", "4 5 6", "7 8 9" ] )

  } )
  it ( 'should respect hideFooter', () => {
    expect ( columnsToDisplay ( { type: "table", hideFooter: true }, text ) ).toEqual ( [ "a b c", "1 2 3", "4 5 6" ] )
  } );
  it ( 'should respect hideHeader and hideFooter', () => {
    expect ( columnsToDisplay ( { type: "table", hideHeader: 2, hideFooter: true }, text ) ).toEqual ( [ "4 5 6" ] )
    expect ( columnsToDisplay ( { type: "table", hideHeader: 1, hideFooter: 2 }, text ) ).toEqual ( [ "1 2 3" ] )
  } )
} )
describe ( "Convert Columns to json", () => {
  it ( "should turn white space separated columns into json with headers given", () => {
    const text = [ `123 phil 2023-2-4`, `234 bob 2023-3-3` ]
    const headers = [ 'number', 'name', 'date' ]
    expect ( columnsToJson ( headers, text ) ).toEqual ( [
      {
        "date": "2023-2-4",
        "name": "phil",
        "number": "123"
      },
      {
        "date": "2023-3-3",
        "name": "bob",
        "number": "234"
      }
    ] )
  } )
} )

describe ( "convert stringToJson for table to json", () => {
  it ( "should convert to json when headers are specified", () => {
    expect ( stringToJson ( text, { type: "table", hideHeader: true, hideFooter: true, headers: [ "A", "B", "C" ] } ) )
      .toEqual ( [
        { "A": "1", "B": "2", "C": "3" },
        { "A": "4", "B": "5", "C": "6" }
      ] )
  } )
  it ( "should stringToJson for table when hide headers", () => {
    expect ( stringToJson ( text, { type: "table", hideHeader: true, hideFooter: true } ) ).toEqual ( [
      { "a": "1", "b": "2", "c": "3" },
      { "a": "4", "b": "5", "c": "6" }
    ] )
  } )
  it ( "should stringToJson for table when nothing specified", () => {
    expect ( stringToJson ( text, { type: "table" }, ) ).toEqual ( [
      { "1": "a", "2": "b", "3": "c" },
      { "1": "1", "2": "2", "3": "3" },
      { "1": "4", "2": "5", "3": "6" },
      { "1": "7", "2": "8", "3": "9" }
    ] )
  } )

  it ( "should stringToJson for json and onelinejson", () => {
    expect ( stringToJson ( [ `{"a":1,"b":2,"c":3}` ], "json", ) ).toEqual ( { a: 1, b: 2, c: 3 } )
    expect ( stringToJson ( [ `{"a":1,"b":2,"c":3}` ], "onelinejson" ) ).toEqual ( { a: 1, b: 2, c: 3 } )
  } )
  it ( "should stringToJson for oneperlinejson", () => {
    expect ( stringToJson ( [ `{"a":1}`, `{"b":2}`, `{"c":3}` ], "oneperlinejson" ) ).toEqual ( [
      { "a": 1 },
      { "b": 2 },
      { "c": 3 }
    ] )
  } )
} )
