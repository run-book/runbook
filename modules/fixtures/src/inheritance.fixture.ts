import { makeStringDag, StringDag } from "@runbook/utils";

export const inheritance: StringDag = makeStringDag ( {
  "environment": [ "prod", "test", "dev" ],
  "service": [ "leo", "npx" ],
} )
