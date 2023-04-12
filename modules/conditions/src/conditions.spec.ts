import { nextCharIn, parseCondition } from "./conditions.parser";


describe ( 'parseCondition', () => {
  describe ( "rootconditions", () => {
    it ( "should parse 'prod:environment'", () => {
      expect ( parseCondition ( "prod:environment" ) ).toEqual ( {
        "type": "root",
        "path": [ { "isa": "environment", "value": "prod" } ],
      } )
    } )

    it ( "should parse '{env}'", () => {
      expect ( parseCondition ( "{env}" ) ).toEqual ( {
        "type": "root",
        "path": [ { variable: 'env' } ],//meaning 'anything'

      } )
    } )
    it ( "should parse '{env:environment}'", () => {
      expect ( parseCondition ( "{env:environment}" ) ).toEqual ( {
        "type": "root",
        "path": [ { variable: "env", isa: 'environment' } ],
      } )
    } )
    it ( "should parse '{env:environment}:prod '", () => {
      expect ( parseCondition ( "{env:environment}=prod" ) ).toEqual ( {
        "type": "root",
        "path": [ { variable: "env", isa: "environment", condition: { type: '=', value: "prod" } } ],
      } )
    } )
    it ( "should parse '{env:environment}=dev.{service:service}=leo", () => {
      expect ( parseCondition ( "{env:environment}=dev.{service:service}=leo" ) ).toEqual ( {
        "type": "root",
        "path": [
          { "variable": "env", "isa": "environment", "condition": { "type": "=", "value": "dev" }, },
          { "variable": "service", "isa": "service", "condition": { "type": "=", "value": "leo" }, } ],
      } )
    } )
    it ( "should parse '{env}.{service:service}.{port}>8080", () => {
      expect ( parseCondition ( "{env}.{service:service}.{port}>8080" ) ).toEqual ( {
        "type": "root",
        "path": [
          { "variable": "env" },
          { "isa": "service", "variable": "service" },
          { "condition": { "type": ">", "value": "8080" }, "variable": "port" }
        ],
      } )
    } )
  } )

  describe ( "and conditions", () => {
    expect ( parseCondition ( "{env:environment}=dev&{service:service}=leo" ) ).toEqual ( {
      "type": "and",
      "conditions": [
        {
          "type": "root",
          "path": [
            { "variable": "env", "isa": "environment", "condition": { "type": "=", "value": "dev" }, },
          ],
        },
        {
          "type": "root",
          "path": [
            { "variable": "service", "isa": "service", "condition": { "type": "=", "value": "leo" }, },
          ],
        } ]
    } )
  } )
} )

