import { convertColumnsToJson } from "./convertColumnsToJson";

describe ( "Convert Columns to json", () => {
  it ( "should turn white space separated columns into json with headers given", () => {
    const text = [ `123 phil 2023-2-4`, `234 bob 2023-3-3` ]
    const headers = [ 'number', 'name', 'date' ]
    expect ( convertColumnsToJson ( headers, text ) ).toEqual ( [
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