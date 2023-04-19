import { displayInterpreter, interpretCondition } from "./tagless.condition";
import { bc } from "./tagless.fixture";

describe ( 'tagless binding', () => {
  describe ( 'displayInterpreter', () => {
    it ( "should display a blank condition", () => {
      expect ( interpretCondition ( bc, displayInterpreter, {}, [], [] ) ).toEqual ( [
        "object []"
      ] )
    } )
    it ( "should display a prod", () => {
      const cond = { "prod": {} }
      expect ( interpretCondition ( bc, displayInterpreter, cond, [], [] ) ).toEqual ( [

        "object []",
        "constant [prod] = prod",
        "object [prod]"
      ] )
    } )
    it ( "should display a {prod:env}", () => {
      const cond = { "{prod:env}": {} }
      expect ( interpretCondition ( bc, displayInterpreter, cond, [], [] ) ).toEqual ( [
        "object []",
        "variable [{prod:env}] = env:prod",
        "object [{prod:env}]"
      ] )
    } )

    it ( "should display a tree", () => {
      const cond = { "{env:environment}": { "{ser:service}": { domain: "{domain}", port: "{port}" } } }
      expect ( interpretCondition ( bc, displayInterpreter, cond, [], [] ) ).toEqual ( [
        "object []",
        "variable [{env:environment}] = environment:env",
        "object [{env:environment}]",
        "variable [{env:environment}.{ser:service}] = service:ser",
        "object [{env:environment}.{ser:service}]",
        "constant [{env:environment}.{ser:service}.domain] = domain",
        "constant [{env:environment}.{ser:service}.domain] = {domain}",
        "constant [{env:environment}.{ser:service}.port] = port",
        "constant [{env:environment}.{ser:service}.port] = {port}"
      ] )
    } )
  } )
} )