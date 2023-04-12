import { BindingContext, eval2 } from "./binding";

const bc: BindingContext = {
  debug: false,
  inheritance: {
    parents: {
      "prod": [ "environment" ],
      "dev": [ "environment" ],
      "leo": [ "service" ],
    },
    children: {
      "environment": [ "prod", "dev" ],
      "service": [ "leo" ],
    }
  }
}
const situation = {
  prod: { some: "data", leo: { domain: "prodLeo", port: 8080 } },
  test: { some: "data", leo: { domain: "testLeo", port: 8080 } },
  dev: { some: 'otherdata', leo: { domain: 'devLeo', port: 80 } }, "junk": "other"
};
const s1 = { s: 1, a: 1, b: 2 }
const s2 = { s: 2, a: 1, b: 2 }
function bind ( path: string | string[], value: string | number ) {
  return { path, value }
}
describe ( 'another way of doing conditions', () => {
  it ( "should detect prod", () => {
    const condition = { "prod": {} }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [ {} ] )
  } )
  it ( "should detect {env}", () => {
    const condition = { "{env}": {} }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      { env: bind ( [ "prod" ], "prod" ) },
      { "env": { "path": [ "test" ], "value": "test" } },
      { env: bind ( [ "dev" ], "dev" ) },
      { env: bind ( [ "junk" ], "junk" ) } ] )

  } )
  it ( "should detect {prod:environment}", () => {
    const condition = { "{prod:environment}": {} }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      { "prod": { "path": [ "prod" ], "value": "prod" } },
      { "prod": { "path": [ "dev" ], "value": "dev" } }
    ] )
  } )
  it ( "should detect s:1", () => {
    const condition = { s: 1 }
    expect ( eval2 ( bc, condition, s1 ) ).toEqual ( [ {} ] ) // matched twice but no variables
    expect ( eval2 ( bc, condition, s2 ) ).toEqual ( [] )
  } )
  it ( "should detect {any}:{s}", () => {
    const condition = { "{any}": "{s}" }
    expect ( eval2 ( bc, condition, s1 ) ).toEqual ( [
      { "any": { "path": [ "s" ], "value": "s" }, "s": { "path": [ "s" ], "value": 1 } },
      { "any": { "path": [ "a" ], "value": "a" }, "s": { "path": [ "a" ], "value": 1 } },
      { "any": { "path": [ "b" ], "value": "b" }, "s": { "path": [ "b" ], "value": 2 } },
    ] ) // matched twice but no variables
  } )
  it ( "should detect {env:{ {ser:service} }}", () => {
    const condition = { "{env}": { "{ser:service}": {} } }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      { "env": { "path": [ "prod" ], "value": "prod" }, "ser": { "path": [ "prod", "leo" ], "value": "leo" } },
      { "env": { "path": [ "test" ], "value": "test" }, "ser": { "path": [ "test", "leo" ], "value": "leo" } },
      { "env": { "path": [ "dev" ], "value": "dev" }, "ser": { "path": [ "dev", "leo" ], "value": "leo" } } ] )
  } )

  it ( "should have a depth 3 condition", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}" } } }//, port: "{port}" } } }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" },
        "env": { "path": [ "prod" ], "value": "prod" }, "ser": {
          "path": [ "prod", "leo" ], "value": "leo"
        }
      },
      {
        "domain": { "path": [ "dev", "leo", "domain" ], "value": "devLeo" },
        "env": { "path": [ "dev" ], "value": "dev" },
        "ser": { "path": [ "dev", "leo" ], "value": "leo" }
      }
    ] )
  } )
  it ( "should have a tree", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: "{port}" } } }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" },
        "env": { "path": [ "prod" ], "value": "prod" },
        "port": { "path": [ "prod", "leo", "port" ], "value": 8080 },
        "ser": { "path": [ "prod", "leo" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "dev", "leo", "domain" ], "value": "devLeo" },
        "env": { "path": [ "dev" ], "value": "dev" },
        "port": { "path": [ "dev", "leo", "port" ], "value": 80 },
        "ser": { "path": [ "dev", "leo" ], "value": "leo" }
      } ] )
  } )
  it ( "should have a tree in the condition - constrained", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: 8080 } } }
    expect ( eval2 ( bc, condition, situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" },
        "env": { "path": [ "prod" ], "value": "prod" },
        "ser": { "path": [ "prod", "leo" ], "value": "leo" }
      } ] )
  } )

} )