import { evaluate } from "./binding";
import { bc } from "./binding.fixture";
import { ref } from "@runbook/fixtures";


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

  it ( "should be able to retrieve a value when we have a nested condition using inheritance", () => {
    const situation = { "test:environment": { "leo:service": { a: 1 } } }
    const condition = { "{env:environment}": { "{service:service}": {} } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {
      "env": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
      "service": { "namespace": "service", "path": [ "test:environment", "leo:service" ], "value": "leo" }
    } ] )

  } )
  it ( "should be able to retrieve a value when we have a nested condition using inheritance from ref", () => {
    const condition = { "{env:environment}": { "{service:service}": {} } }
    expect ( evaluate ( bc, condition ) ( ref ) ).toEqual ( [
      {
        "env": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "service": { "namespace": "service", "path": [ "dev:environment", "leo:service" ], "value": "leo" }
      },

      {
        "env": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "service": { "namespace": "service", "path": [ "dev:environment", "npx:service" ], "value": "npx" }
      },
      {
        "env": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "service": { "namespace": "service", "path": [ "test:environment", "leo:service" ], "value": "leo" }
      },
      {
        "env": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "service": { "namespace": "service", "path": [ "test:environment", "npx:service" ], "value": "npx" }
      }, {
        "env": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "service": { "namespace": "service", "path": [ "prod:environment", "leo:service" ], "value": "leo" }
      },
      {
        "env": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "service": { "namespace": "service", "path": [ "prod:environment", "npx:service" ], "value": "npx" }
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
