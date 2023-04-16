import { fixtureView, inheritance, mereology, ref } from "@runbook/fixtures";
import { inheritsFrom, mapObjValues } from "@runbook/utils";
import { BindingContext } from "@runbook/bindings";
import { fromMereology } from "@runbook/mereology";
import { applyTrueConditions, bindingsToDictionary, evaluateViewConditions } from "./evaluateViews";
import { bindings2, bindings1, situation1, situation2 } from "./views.fixture";


export const bc: BindingContext = {
  debug: false,
  mereology,
  refDataFn: fromMereology ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}


describe ( "evaluateViews", () => {
  describe ( "evaluateViewConditions", () => {
    it ( "should work out which instruments to load, and their arguments - situation 1", () => {
      expect ( evaluateViewConditions ( bc, fixtureView ) ( situation1 ) ).toEqual ( bindings1 )
    } )
    it ( "should work out which instruments to load, and their arguments - situation 1", () => {
      expect ( evaluateViewConditions ( bc, fixtureView ) ( situation2 ) ).toEqual ( bindings2 )
    } )
  } )

  describe ( "bindingsToDictionary", () => {
    it ( "should make a nameand that is just name => value", () => {
      expect ( mapObjValues ( bindings1, bs => bs.map ( bindingsToDictionary ) ) ).toEqual ( {
        "findDiffs": [],
        "getRepo": [
          { "repoUrl": "leo.git.url", "ser": "leo" },
          { "repoUrl": "npx.git.url", "ser": "npx" }
        ]
      } )
    } )
  } )
  describe ( "applyTrueConditions", () => {
    it ( "should work out which instruments are to fire, and what the arguments are -sit1", () => {
      expect ( applyTrueConditions ( fixtureView ) ( bindings1 ) ).toEqual ( {
        "findDiffs": [],
        "getRepo": [
          { "type": "instrument", "name": "getRepo", "addTo": "{ser}", "params": { "repoUrl": "leo.git.url", "service": "leo" }, },
          { "addTo": "{ser}", "name": "getRepo", "params": { "repoUrl": "npx.git.url", "service": "npx" }, "type": "instrument" }
        ]
      } )
    } )
    it ( "should work out which instruments are to fire, and what the arguments are -sit2", () => {
      expect ( applyTrueConditions ( fixtureView ) ( bindings2 ) ).toEqual ( {
        "findDiffs": [
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "leo", "tag": "prod" }, "type": "instrument" },
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "npx", "tag": "prod" }, "type": "instrument" },
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "leo", "tag": "test" }, "type": "instrument" },
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "npx", "tag": "test" }, "type": "instrument" },
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "leo", "tag": "dev" }, "type": "instrument" },
          { "addTo": "{env}", "name": "findDiffs", "params": { "git": "npx", "tag": "dev" }, "type": "instrument" } ],
        "getRepo": [
          { "type": "instrument", "name": "getRepo", "addTo": "{ser}", "params": { "repoUrl": "leo.git.url", "service": "leo" }, },
          { "addTo": "{ser}", "name": "getRepo", "params": { "repoUrl": "npx.git.url", "service": "npx" }, "type": "instrument" } ]
      } )
    } )
  } )
} )