import { fixtureView } from "@runbook/fixtures";
import { View } from "./views";
import { NameAnd } from "@runbook/utils";
import { Binding } from "@runbook/bindings";

const checkView: View = fixtureView


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
export let bindings1: NameAnd<Binding[]> = {
  "findDiffs": [],
  "getRepo": [ {
    "repoUrl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
    "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
  },
    {
      "repoUrl": { "path": [ "npx", "git", "url" ], "value": "npx.git.url" },
      "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
    } ]
};

export let bindings2 = {
  "findDiffs": [
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
    } ],
  "getRepo":
    [
      {
        "repoUrl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
        "ser": { "namespace": "service", "path": [ "leo" ], "value": "leo" }
      },
      {
        "repoUrl": { "path": [ "npx", "git", "url" ], "value": "npx.git.url" },
        "ser": { "namespace": "service", "path": [ "npx" ], "value": "npx" }
      } ]
};
