import { fromMereology } from "./mereology";
import { ref } from "@runbook/fixtures";

describe ( "it should get direct objects from the mereology", () => {
  it ( "should find it if in", () => {
    expect ( fromMereology ( ref ) ( [], 'service', 'leo' ) ).toEqual ( {
      "git": { "url": "leo.git.url" }
    } )
  } )
  it ( "shouldn't find it if not in", () => {
    expect ( fromMereology ( ref ) ( [], 'service', 'notAService' ) ).toEqual ( undefined )
  } )
} )

describe ( "it should merge the data knowledge of the bound things", () => {
  it ( "should find leo in the test environment", () => {
    expect ( fromMereology ( ref ) ( [ { namespace: 'environment', value: 'test' } ], 'service', 'leo' ) ).toEqual ( {
      "domain": "test.leo",
      "git": { "url": "leo.git.url" },
      "port": 80
    } )
  } )
} )