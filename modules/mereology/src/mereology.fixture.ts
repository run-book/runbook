import { Mereology, ReferenceData } from "./mereology";

const mereologyDefn =
        {
          "environments": {
            "dev:environment": {
              "services": {
                "leo:service": { domain: 'dev.leo', port: 80 },
                "npx:service": { domain: 'dev.npx', port: 80 }
              },
              database: { "ngtest": {} }
            },
            "test:environment": {
              "services": {
                "leo:service": { domain: 'test.leo', port: 80 },
                "npx:service": { domain: 'test.npx', port: 80 }
              },
              database: { "ngtest": {} }
            }
          },
          databases: {
            "ngprod:database": { url: "ngprod.url" },
            "ngtest:database": { url: "ngtest.url" },
          },
          services: {
            "leo:service": { git: { url: 'leo.git.url' } },
            "npx:service": { git: { url: 'npx.git.url' } }
          }
        }

const devLeoM: ReferenceData = {}

export const mereology: Mereology={
  "environment":{
    "service":{},
    "database":{}
  }
}
export const ref: ReferenceData = {
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
