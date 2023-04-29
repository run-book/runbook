import { recursivelyMap } from "./nameAnd";

describe ( "recursivelyMap", () => {
  it ( "should walk over all children", () => {
    expect ( recursivelyMap ( { a: { b: { c: 1 } } }, ( path, name, t ) => `${path}-${name}:${JSON.stringify ( t )}` ) )
      .toEqual ( [
        "-a:{\"b\":{\"c\":1}}",
        "a-b:{\"c\":1}",
        "a,b-c:1"
      ] )
  } )
} )