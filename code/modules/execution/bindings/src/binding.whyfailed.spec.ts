import { BindingContext, evaluate, WhyFailedToMatch } from "./binding";
import { bc, bind, situation } from "./binding.fixture";
import { inheritsFrom, Primitive } from "@runbook/utils";


function makeWhyFailedToMatch () {
  let recorded: string[] = []
  function record ( ...args: any[] ) {
    recorded.push ( args.map ( x => typeof x === 'object' ? JSON.stringify ( x ).replace(/"/g,"'") : x ).join ( "/" ) )
  }
  return {
    doesntMatchInheritance ( condPath: string[], cond: string, sitPath: string[], sit: any ) {
      record ( 'doesntMatchInheritance', condPath, cond, sitPath.join ( '.' ) )
    },
    doesntMatchPrimitive ( condPath: string[], cond: Primitive, sitPath: string[], sit: any ) {
      record ( 'doesntMatchPrimitive', cond, sitPath.join ( '.' ) )
    },
    lookingForStringToMatchVariable ( condPath: string[], cond: string, sitPath: string[], sit: any ) {
      record ( 'lookingForStringToMatchVariable', cond, sitPath.join ( '.' ) )
    },
    notInMereology ( condPath: string[], cond: Primitive, sitPath: string[], sit: any ) {
      record ( 'notInMereology', cond, sitPath.join ( '.' ) )
    },
    situationUndefined ( condPath: string[], cond: Primitive, sitPath: string[], sit: any ) {
      record ( 'situationUndefined', cond, sitPath.join ( '.' ) )
    },
    recorded
  };
}

describe ( "whyFailed", () => {
  describe ( "success", () => {
    it ( "should not record anything", () => {
      let whyFailedToMatch = makeWhyFailedToMatch ();
      const thisBc: BindingContext = { ...bc, whyFailedToMatch }
      const condition = { "{env}": {} }
      expect ( evaluate ( bc, condition ) ( situation ) ).toEqual ( [
        { env: bind ( [ "prod" ], "prod" ) },
        { env: { path: [ "test" ], value: "test" } },
        { env: bind ( [ "dev" ], "dev" ) },
        { env: bind ( [ "junk" ], "junk" ) } ] )

      expect ( whyFailedToMatch.recorded ).toEqual ( [] )
    } )
  } )
  describe ( "failure", () => {
    it ( "should record why it failed", () => {
      let whyFailedToMatch = makeWhyFailedToMatch ();
      const thisBc: BindingContext = { ...bc, whyFailedToMatch }
      const situation = { "leo": { "eats": "pigeon:animal" } }
      const condition = { "{eater:animal}": { "eats": "{eaten:animal}" } }
      expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [] )
      expect ( whyFailedToMatch.recorded ).toEqual ( [
        "doesntMatchInheritance/['{eater:animal}']/{eater:animal}/leo"
      ] )
    } )
  } )
} )