import { fixtureView, inheritance, mereology, ref } from "@runbook/fixtures";
import { inheritsFrom, mapObjValues } from "@runbook/utils";
import { BindingContext } from "@runbook/bindings";
import { applyTrueConditions, bindingsToDictionary, evaluateViewConditions } from "./evaluateViews";
import { evcr1, evcr2, situation1, situation2 } from "./views.fixture";
import { validateView } from "./views";
import { fromReferenceData } from "@runbook/referencedata";
import { mereologyToSummary } from "@runbook/mereology";


export const bc: BindingContext = {
  debug: false,
  mereology: mereologyToSummary ( mereology as any ),
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}


describe ( "evaluateViews", () => {
  describe ( "evaluateViewConditions", () => {
    it ( "should work out which instruments to load, and their arguments - situation 1", () => {
      expect ( evaluateViewConditions ( bc, fixtureView ) ( situation1 ) ).toEqual ( evcr1 )
    } )
    it ( "should work out which instruments to load, and their arguments - situation 1", () => {
      expect ( evaluateViewConditions ( bc, fixtureView ) ( situation2 ) ).toEqual ( evcr2 )
    } )
  } )

  describe ( "bindingsToDictionary", () => {
    it ( "should make a nameand that is just name => value", () => {
      expect ( mapObjValues ( evcr1, results => results.bindings.map ( bindingsToDictionary ) ) ).toEqual ( {
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
      expect ( applyTrueConditions ( fixtureView ) ( evcr1 ) ).toEqual ( {
        "findDiffs": [],
        "getRepo": [
          {
            "addTo": "{ser}",
            "binding": {
              "repoUrl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
              "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
            },
            "name": "getRepo", "params": { "repoUrl": "leo.git.url", "service": "leo" }, "type": "instrument"
          },
          {
            "addTo": "{ser}",
            "binding": {
              "repoUrl": { "path": [ "npx", "git", "url" ], "value": "npx.git.url" },
              "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
            },
            "name": "getRepo",
            "params": { "repoUrl": "npx.git.url", "service": "npx" },
            "type": "instrument"
          }
        ]
      } )
    } )
    it ( "should work out which instruments are to fire, and what the arguments are -sit2", () => {
      let actual = applyTrueConditions ( fixtureView ) ( evcr2 );
      const withoutBindings = mapObjValues ( actual, bs => bs.map ( b => ({ ...b, binding: undefined }) ) )
      expect ( withoutBindings ).toEqual ( {
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

describe ( 'validateView', () => {
  it ( 'should validate the view in the fixture', () => {
    expect ( validateView ( 'prefix' ) ( fixtureView ) ).toEqual ( [] )
  } )
  it ( "should report issues with a blank view", () => {
    expect ( validateView ( 'prefix' ) ( {} as any ) ).toEqual ( [
      "prefix.type is undefined",
      "prefix.description is undefined",
      "prefix.usage is undefined",
      "prefix.preconditions is undefined",
      "prefix.fetchers is undefined"
    ] )

  } )
} )