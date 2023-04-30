import { makeBindingsForRefData } from "./ref.react";
import { ref } from "@runbook/fixtures";
import { bc } from "./ref.react.fixture";


describe ( "makeBindingsForRefData", () => {
  it ( "should extract env/services from a reference data", () => {
    expect ( makeBindingsForRefData ( bc, 'environment', 'service', ref ) ).toEqual ( [
      {
        "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "service": { "namespace": "service", "path": [ "dev:environment", "leo:service" ], "value": "leo" }
      },

      {
        "environment": { "namespace": "environment", "path": [ "dev:environment" ], "value": "dev" },
        "service": { "namespace": "service", "path": [ "dev:environment", "npx:service" ], "value": "npx" }
      },
      {
        "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "service": { "namespace": "service", "path": [ "test:environment", "leo:service" ], "value": "leo" }
      },
      {
        "environment": { "namespace": "environment", "path": [ "test:environment" ], "value": "test" },
        "service": { "namespace": "service", "path": [ "test:environment", "npx:service" ], "value": "npx" }
      }, {
        "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "service": { "namespace": "service", "path": [ "prod:environment", "leo:service" ], "value": "leo" }
      },
      {
        "environment": { "namespace": "environment", "path": [ "prod:environment" ], "value": "prod" },
        "service": { "namespace": "service", "path": [ "prod:environment", "npx:service" ], "value": "npx" }
      } ] )
  } )

} )