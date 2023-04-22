import { splitUpByLayout } from "./layout";

describe ( "splitUpByLayout", () => {
  it ( "should []", () => {
    expect ( splitUpByLayout ( [], [ "a", "b", "c", "d", "e" ] ) ).toEqual ( [
      [ { "width": 12, "children": [ "a", "b", "c", "d", "e" ], } ] ] )
  } )
  it ( "should [1]", () => {
    expect ( splitUpByLayout ( [ 1 ], [ "a", "b", "c", "d", "e" ] ) ).toEqual ( [
      [ { "children": [ "a" ], "width": 12 } ],
      [ { "children": [ "b", "c", "d", "e" ], "width": 12 } ]
    ] )
  } )
  it ( "should [[1,1]]", () => {
    expect ( splitUpByLayout ( [ [ 1, 1 ] ], [ "a", "b", "c", "d", "e" ] ) ).toEqual ( [
      [ { "children": [ "a" ], "width": 6 }, { "children": [ "b" ], "width": 6 } ],
      [ { "children": [ "c", "d", "e" ], "width": 12 } ]
    ] )
  } )
  it ( "should [[2,2]]", () => {
    expect ( splitUpByLayout ( [ [ 2, 2 ] ], [ "a", "b", "c", "d", "e" ] ) ).toEqual ( [
      [ { "children": [ "a", "b" ], "width": 6 }, { "children": [ "c", "d" ], "width": 6 } ],
      [ { "children": [ "e" ], "width": 12 } ] ] )
  } )
  it ( "should [[1,1],[2,1]]", () => {
    expect ( splitUpByLayout ( [ [ 1, 1 ], [ 2, 1 ] ], [ "a", "b", "c", "d", "e" ] ) )
      .toEqual ( [
        [ { "children": [ "a" ], "width": 6 }, { "children": [ "b" ], "width": 6 } ],
        [ { "children": [ "c", "d" ], "width": 6 }, { "children": [ "e" ], "width": 6 } ]
      ] )
  } )
} )
