import { BindingContext } from "./binding";
import { fromMereology, Mereology, ReferenceData } from "@runbook/mereology";
import { inheritsFrom, makeStringDag, StringDag } from "@runbook/utils";


export const inheritance: StringDag = makeStringDag ( {
  "environment": [ "prod", "test", "dev" ],
  "service": [ "leo" ],
} )
export const mereology: Mereology = { "environment": [ "service", "server", "database" ] }

export const ref: ReferenceData =  {
  'bound': {
    "environment": {
      "dev": {
        "direct": {
          database: { "ngtest": {} },
          "service": {
            "leo": { domain: 'dev.leo', port: 80 },
            "npx": { domain: 'dev.npx', port: 80 }
          }
        }
      },
      "test": {
        "direct": {
          database: { "ngtest": {} },
          "service": {
            "leo": { domain: 'test.leo', port: 80 },
            "npx": { domain: 'test.npx', port: 80 }
          }
        }
      }
    }
  },
  direct: {
    database: {
      "ngprod": { url: "ngprod.url" },
      "ngtest": { url: "ngtest.url" },
    },
    service: {
      "leo": { git: { url: 'leo.git.url' } },
      "npx": { git: { url: 'npx.git.url' } }
    }
  }
}

export const bc: BindingContext = {
  debug: false,
  mereology,
  refDataFn: fromMereology ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}
export const situation = {
  prod: { some: "data", leo: { domain: "prodLeo", port: 8080 } },
  test: { some: "data", leo: { domain: "testLeo", port: 8080 } },
  dev: { some: 'otherdata', leo: { domain: 'devLeo', port: 80 } }, "junk": "other"
};
export const s1 = { s: 1, a: 1, b: 2 }
export const s2 = { s: 2, a: 1, b: 2 }
