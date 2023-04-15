import { evaluate } from "./binding";
import { bc } from "./binding.fixture";


describe ( "binding into mereology", () => {
  it ( "should be able to retrieve a value from a direct mereology", () => {
    const situation = { "leo": {} }
    const condition = { "{service:service}": { "git": { url: "{giturl}" } } }
    expect ( evaluate ( bc, condition, situation ) ).toEqual ( [ {
      "giturl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "service": { "path": [ "leo" ], "value": "leo", "namespace": "service" }
    } ] )
  } )
} )
