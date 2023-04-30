import { makeBindingsForParentChildRefData, makeConditionToDisplayOneRefData, makeConditionToDisplayParentChildRefData } from "./ref.react";
import { mereology, ref } from "@runbook/fixtures";
import { bc } from "./ref.react.fixture";

describe ( "makeConditionToDisplayRefData", () => {
  describe ( "makeConditionToDisplayRefData", () => {
    it ( "should use the parent/child and add the fields of the child", () => {
      expect ( makeConditionToDisplayParentChildRefData ( mereology as any, 'environment', 'service' ) ).toEqual ( {
        "{environment:environment}": {
          "{service:service}": {
            "domain": "{domain?:}",
            "port": "{port?:}",
            "protocol": "{protocol?:}"
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
describe ( "makeBindingsForRefData", () => {
  it ( "should extract env/services from a reference data", () => {
    expect ( makeBindingsForParentChildRefData ( bc, 'environment', 'service', mereology as any, ref ) ).toEqual ( [
      {
        "domain": { "path": [ "dev:environment", "leo:service", "domain" ], "value": "dev.leo" },
        "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "port": { "path": [ "dev:environment", "leo:service", "port" ], "value": 80 },
        "protocol": { "path": [ "dev:environment", "leo:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "dev:environment", "leo:service" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "dev:environment", "npx:service", "domain" ], "value": "dev.npx" },
        "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "port": { "path": [ "dev:environment", "npx:service", "port" ], "value": 80 },
        "protocol": { "path": [ "dev:environment", "npx:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "dev:environment", "npx:service" ], "value": "npx" }
      },
      {
        "domain": { "path": [ "test:environment", "leo:service", "domain" ], "value": "test.leo" },

        "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "port": { "path": [ "test:environment", "leo:service", "port" ], "value": 80 },
        "protocol": { "path": [ "test:environment", "leo:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "test:environment", "leo:service" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "test:environment", "npx:service", "domain" ], "value": "test.npx" },
        "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "port": { "path": [ "test:environment", "npx:service", "port" ], "value": 80 },
        "protocol": { "path": [ "test:environment", "npx:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "test:environment", "npx:service" ], "value": "npx" }
      },
      {
        "domain": { "path": [ "prod:environment", "leo:service", "domain" ], "value": "prod.leo" },
        "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "port": { "path": [ "prod:environment", "leo:service", "port" ], "value": 80 },
        "protocol": { "path": [ "prod:environment", "leo:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "prod:environment", "leo:service" ], "value": "leo" }
      },
      {
        "domain": { "path": [ "prod:environment", "npx:service", "domain" ], "value": "prod.npx" },
        "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "port": { "path": [ "prod:environment", "npx:service", "port" ], "value": 80 },
        "protocol": { "path": [ "prod:environment", "npx:service", "protocol" ] },
        "service": { "namespace": "service", "path": [ "prod:environment", "npx:service" ], "value": "npx" }
      }
    ] )
  } )

} )