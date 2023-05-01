import { makeConditionToDisplayOneRefData, makeConditionToDisplayParentChildRefData } from "./ref.react";
import { mereology } from "@runbook/fixtures";

describe ( "makeConditionToDisplayRefData", () => {
  describe ( "makeConditionToDisplayRefData", () => {
    it ( "environment/service", () => {
      expect ( makeConditionToDisplayParentChildRefData ( mereology as any, {parent:'environment', child:'service'} ) ).toEqual ( {
        "{environment:environment}": {
          "{service:service}": {
            "domain": "{domain?:}",
            "port": "{port?:}",
            "protocol": "{protocol?:}"
          }
        }
      } )
    } )
    it ( "service/git", () => {
      expect ( makeConditionToDisplayParentChildRefData ( mereology as any, {parent:'service', child:'git'} ) ).toEqual ( {
        "{service:service}": {
          "{git:git}": {
            "url": "{url?:}"
          }
        }
      } )
    } )
  } )

  describe ( "makeConditionToDisplayOneRefData", () => {
    it ( "should use fields - service", () => {
      expect ( makeConditionToDisplayOneRefData ( mereology as any, 'service' ) ).toEqual ( {
        "{service:service}": {
          "summary": "{summary?:}"
        }
      } )

    } )
    it ( "should use fields - environment", () => {
      expect ( makeConditionToDisplayOneRefData ( mereology as any, 'environment' ) ).toEqual ( {
        "{environment:environment}": {
          "gittag": "{gittag?:}"
        }
      } )
    } )
  } )
} )
// describe ( "makeBindingsForRefData", () => {
//   it ( "should extract env/services from a reference data", () => {
//     expect ( makeConditionToDisplayParentChildRefData ( bc, 'environment', 'service', mereology as any, ref ) ).toEqual ( [
//       {
//         "domain": { "path": [ "dev:environment", "leo:service", "domain" ], "value": "dev.leo" },
//         "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
//         "port": { "path": [ "dev:environment", "leo:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "dev:environment", "leo:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "dev:environment", "leo:service" ], "value": "leo" }
//       },
//       {
//         "domain": { "path": [ "dev:environment", "npx:service", "domain" ], "value": "dev.npx" },
//         "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
//         "port": { "path": [ "dev:environment", "npx:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "dev:environment", "npx:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "dev:environment", "npx:service" ], "value": "npx" }
//       },
//       {
//         "domain": { "path": [ "test:environment", "leo:service", "domain" ], "value": "test.leo" },
//
//         "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
//         "port": { "path": [ "test:environment", "leo:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "test:environment", "leo:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "test:environment", "leo:service" ], "value": "leo" }
//       },
//       {
//         "domain": { "path": [ "test:environment", "npx:service", "domain" ], "value": "test.npx" },
//         "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
//         "port": { "path": [ "test:environment", "npx:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "test:environment", "npx:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "test:environment", "npx:service" ], "value": "npx" }
//       },
//       {
//         "domain": { "path": [ "prod:environment", "leo:service", "domain" ], "value": "prod.leo" },
//         "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
//         "port": { "path": [ "prod:environment", "leo:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "prod:environment", "leo:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "prod:environment", "leo:service" ], "value": "leo" }
//       },
//       {
//         "domain": { "path": [ "prod:environment", "npx:service", "domain" ], "value": "prod.npx" },
//         "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
//         "port": { "path": [ "prod:environment", "npx:service", "port" ], "value": 80 },
//         "protocol": { "path": [ "prod:environment", "npx:service", "protocol" ] },
//         "service": { "namespace": "service", "path": [ "prod:environment", "npx:service" ], "value": "npx" }
//       }
//     ] )
//   } )
//
// } )