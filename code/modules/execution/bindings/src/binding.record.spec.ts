import { BindingContext, evaluate, makeWhyFailedToMatch, matchRecordToString } from "./binding";
import { bc, bind, situation } from "./binding.fixture";

describe ( "whyFailed", () => {
  describe ( "success", () => {
    it ( "should record the matches", () => {
      let whyFailedToMatch = makeWhyFailedToMatch ();
      const thisBc: BindingContext = { ...bc, whyFailedToMatch }
      const condition = { "{env}": {} }
      expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [
        { env: bind ( [ "prod" ], "prod" ) },
        { env: { path: [ "test" ], value: "test" } },
        { env: bind ( [ "dev" ], "dev" ) },
        { env: bind ( [ "junk" ], "junk" ) } ] )

      expect ( whyFailedToMatch.recorded.map(matchRecordToString) ).toEqual ([
        "foundMatch {env} {env} prod prod",
        "foundMatch {env} {env} test test",
        "foundMatch {env} {env} dev dev",
        "foundMatch {env} {env} junk junk"
      ] )
    } )
  } )
  describe ( "failure", () => {
    it ( "should record why it failed", () => {
      let whyFailedToMatch = makeWhyFailedToMatch ();
      const thisBc: BindingContext = { ...bc, whyFailedToMatch }
      const situation = { "leo": { "eats": "pigeon:animal" } }
      const condition = { "{eater:animal}": { "eats": "{eaten:animal}" } }
      expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [] )
      expect ( whyFailedToMatch.recorded.map(matchRecordToString) ).toEqual ([
        "doesntMatchInheritance {eater:animal} {eater:animal} leo leo",
        "noMatch {eater:animal} {eater:animal} leo leo"
      ])
    } )
  } )
} )