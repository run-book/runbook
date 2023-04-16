import { evaluate } from "./binding";
import { bc } from "./binding.fixture";


describe ( "binding into mereology", () => {
  it ( "should be able to retrieve a value from a direct mereology", () => {
    const situation = { "leo": {} }
    const condition = { "{service:service}": { "git": { url: "{giturl}" } } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {
      "giturl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "service": { "path": [ "leo" ], "value": "leo", "namespace": "service" }
    } ] )
  } )

  it ( "should be able to retrieve a value from a bound mereology", () => {
    const situation = { test: {}, leo: {} }
    const condition = { "{service:service}": { "git": { url: "{giturl}" }, domain: "{domain}" }, "{env:environment}": {}, }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {
      "domain": { "path": [ "leo", "domain" ], "value": "test.leo" },
      "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
      "giturl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "service": { "path": [ "leo" ], "value": "leo", "namespace": "service" }
    } ] )
  } )
  it ( "should be able to retrieve a value from a bound mereology when the order is different", () => {
    const situation = { test: {}, leo: {} }
    const condition = { "{env:environment}": {}, "{service:service}": { "git": { url: "{giturl}" }, domain: "{domain}" }, }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {
      "domain": { "path": [ "leo", "domain" ], "value": "test.leo" },
      "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
      "giturl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "service": { "path": [ "leo" ], "value": "leo", "namespace": "service" }
    } ] )
  } )
} )
