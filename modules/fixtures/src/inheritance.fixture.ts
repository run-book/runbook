import { makeStringDag, NameAnd, StringDag } from "@runbook/utils";

export const inheritanceDefn: NameAnd<string[]> = {
  "environment": [ "prod", "test", "dev" ],
  "service": [ "leo", "npx" ],
};
export const inheritance: StringDag = makeStringDag ( inheritanceDefn )
