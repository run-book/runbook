import { evaluate } from "./binding";
import { bc } from "./binding.fixture";

describe ( "binding optionals - just leafs for now", () => {
  it ( "should be return an undefined value for an failed optional", () => {
    const situation = { "leo": {} }
    const condition = { "{service:service}": { "port": "{port?:}" } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {
      "service": { "namespace": "service", "path": [ "leo" ], "value": "leo" },
      "port": { "path": [ "leo", "port" ], value: undefined }
    } ] )
  } )
} )