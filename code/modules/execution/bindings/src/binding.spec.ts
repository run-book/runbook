import { evaluate, makeCount, makeVarNameAndInheritsFromCount } from "./binding";
import { bc, bind, s1, s2, situation } from "./binding.fixture";



describe ( 'another way of doing conditions', () => {
  it ( "should detect prod", () => {
    const condition = { "prod": {} }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [ {} ] )
  } )
  it ( "should detect {env}", () => {
    const condition = { "{env}": {} }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      { env: bind ( [ "prod" ], "prod" ) },
      { "env": { "path": [ "test" ], "value": "test" } },
      { env: bind ( [ "dev" ], "dev" ) },
      { env: bind ( [ "junk" ], "junk" ) } ] )

  } )
  it ( "should detect {env:environment}", () => {
    const condition = { "{env:environment}": {} }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      { "env": { "path": [ "prod" ], "value": "prod", "namespace": "environment", } },
      { "env": { "path": [ "test" ], "value": "test", "namespace": "environment", } },
      { "env": { "path": [ "dev" ], "value": "dev", "namespace": "environment", } }
    ] )
  } )
  it ( "should detect s:1", () => {
    const condition = { s: 1 }
    expect ( evaluate ( bc, condition ) ( s1 ) ).toEqual ( [ {} ] ) // matched but no variables
    expect ( evaluate ( bc, condition ) ( s2 ) ).toEqual ( [] )
  } )
  it ( "should detect {any}:{s}", () => {
    const condition = { "{any}": "{s}" }
    expect ( evaluate ( bc, condition ) ( s1 ) ).toEqual ( [
      { "any": { "path": [ "s" ], "value": "s" }, "s": { "path": [ "s" ], "value": 1 } },
      { "any": { "path": [ "a" ], "value": "a" }, "s": { "path": [ "a" ], "value": 1 } },
      { "any": { "path": [ "b" ], "value": "b" }, "s": { "path": [ "b" ], "value": 2 } },
    ] ) // matched twice but no variables
  } )
  it ( "should detect {env:{ {ser:service} }}", () => {
    const condition = { "{env}": { "{ser:service}": {} } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      { "env": { "path": [ "prod" ], "value": "prod" }, "ser": { "path": [ "prod", "leo" ], "value": "leo", "namespace": "service" } },
      { "env": { "path": [ "test" ], "value": "test" }, "ser": { "path": [ "test", "leo" ], "value": "leo", "namespace": "service" } },
      { "env": { "path": [ "dev" ], "value": "dev" }, "ser": { "path": [ "dev", "leo" ], "value": "leo", "namespace": "service" } } ] )
  } )

  it ( "should have a depth 3 condition", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}" } } }//, port: "{port}" } } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" },
        "env": { "path": [ "prod" ], "value": "prod", "namespace": "environment" },
        "ser": { "path": [ "prod", "leo" ], "value": "leo", "namespace": "service" }
      }, {
        "domain": { "path": [ "test", "leo", "domain" ], "value": "testLeo" },
        "env": { "path": [ "test" ], "value": "test", "namespace": "environment" },
        "ser": { "path": [ "test", "leo" ], "value": "leo", "namespace": "service" }
      },
      {
        "domain": { "path": [ "dev", "leo", "domain" ], "value": "devLeo" },
        "env": { "path": [ "dev" ], "value": "dev", "namespace": "environment" },
        "ser": { "path": [ "dev", "leo" ], "value": "leo", "namespace": "service" }
      }
    ] )
  } )
  it ( "should have a tree", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: "{port}" } } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" },
        "env": { "path": [ "prod" ], "value": "prod", "namespace": "environment" },
        "port": { "path": [ "prod", "leo", "port" ], "value": 8080 },
        "ser": { "path": [ "prod", "leo" ], "value": "leo", "namespace": "service" }
      },
      {
        "domain": { "path": [ "test", "leo", "domain" ], "value": "testLeo" },
        "env": { "path": [ "test" ], "value": "test", "namespace": "environment" },
        "port": { "path": [ "test", "leo", "port" ], "value": 8080 },
        "ser": { "path": [ "test", "leo" ], "value": "leo", "namespace": "service" }
      },
      {
        "domain": { "path": [ "dev", "leo", "domain" ], "value": "devLeo" },
        "env": { "path": [ "dev" ], "value": "dev", "namespace": "environment" },
        "port": { "path": [ "dev", "leo", "port" ], "value": 80 },
        "ser": { "path": [ "dev", "leo" ], "value": "leo", "namespace": "service" }
      } ] )
  } )
  it ( "should have a tree in the condition - constrained", () => {
    const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: "{port}" } } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
      {
        "domain": { "path": [ "prod", "leo", "domain" ], "value": "prodLeo" }, "env": { "namespace": "environment", "path": [ "prod" ], "value": "prod" },
        "port": { "path": [ "prod", "leo", "port" ], "value": 8080 },
        "ser": { "namespace": "service", "path": [ "prod", "leo" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "test", "leo", "domain" ], "value": "testLeo" },
        "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
        "port": { "path": [ "test", "leo", "port" ], "value": 8080 },
        "ser": { "namespace": "service", "path": [ "test", "leo" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "dev", "leo", "domain" ], "value": "devLeo" },
        "env": { "namespace": "environment", "path": [ "dev" ], "value": "dev" },
        "port": { "path": [ "dev", "leo", "port" ], "value": 80 },
        "ser": { "namespace": "service", "path": [ "dev", "leo" ], "value": "leo" }
      } ] )
  } )

  it ( "should handle 'not found'", () => {
    const situation = { "leo": {} }
    const condition = { "{service:service}": { "not": { in: "{something}" } } }
    expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [] )
  } )

  it ( "should not keep remaking things", () => {
      const condition = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: "{port}" } } }
      let evalThisCondition = evaluate ( bc, condition );
      evalThisCondition ( situation )
      const startMakeCount = makeCount
      const startMakeVarCount = makeVarNameAndInheritsFromCount
      evalThisCondition ( situation )
      evalThisCondition ( situation )
      evalThisCondition ( situation )
      expect ( makeCount ).toEqual ( startMakeCount )
      expect ( makeVarNameAndInheritsFromCount ).toEqual ( startMakeVarCount )
    }
  )

} )