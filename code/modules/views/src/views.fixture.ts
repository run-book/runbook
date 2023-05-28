import { echoScriptInstrument, fixtureView, lsScriptInstrument } from "@runbook/fixtures";
import { View } from "./views";
import { NameAnd } from "@runbook/utils";
import { EvaluateViewConditionResult } from "./evaluateViews";
import { ScriptInstrument } from "@runbook/scriptinstruments";

const checkView: View = fixtureView

const name2InstrumentObj: any = {
  echo: echoScriptInstrument,
  ls: lsScriptInstrument
}
export const name2Instrument = ( name: string ) => name2InstrumentObj[ name ] as ScriptInstrument

export const situation1 = {
  "prod": {},
  "test": {},
  "dev": {},
  "leo": {},
  "npx": {}
}
export const situation2 = {
  "prod": {},
  "test": {},
  "dev": {},
  "leo": { git: { "directory": "leo" } },
  "npx": { git: { "directory": "npx" } },
}
export let evcr1: NameAnd<EvaluateViewConditionResult> = {
  "findDiffs": { instrumentName: 'findDiffs', bindings: [] },
  "getRepo": {
    instrumentName: 'getRepo', bindings: [ {
      "repoUrl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
    },
      {
        "repoUrl": { "path": [ "npx", "git", "url" ], "value": "npx.git.url" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      } ]
  }
};


export let evcr2: NameAnd<EvaluateViewConditionResult> = {
  "findDiffs": {
    instrumentName: 'findDiffs', bindings: [
      {
        "env": { "namespace": "environment", "path": [ "prod" ], "value": "prod" },
        "git": { "path": [ "leo", "git", "directory" ], "value": "leo" },
        "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
      },
      {
        "env": { "namespace": "environment", "path": [ "prod" ], "value": "prod" },
        "git": { "path": [ "npx", "git", "directory" ], "value": "npx" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      },
      {
        "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
        "git": { "path": [ "leo", "git", "directory" ], "value": "leo" },
        "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
      }, {
        "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
        "git": { "path": [ "npx", "git", "directory" ], "value": "npx" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      },
      {
        "env": { "namespace": "environment", "path": [ "dev" ], "value": "dev" },
        "git": { "path": [ "leo", "git", "directory" ], "value": "leo" },
        "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
      },
      {
        "env": { "namespace": "environment", "path": [ "dev" ], "value": "dev" },
        "git": { "path": [ "npx", "git", "directory" ], "value": "npx" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      } ]
  },
  "getRepo": {
    instrumentName: 'getRepo', bindings: [
      {
        "repoUrl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
        "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
      },
      {
        "repoUrl": { "path": [ "npx", "git", "url" ], "value": "npx.git.url" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      } ]
  }
};
