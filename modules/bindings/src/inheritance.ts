import { NameAnd } from "@runbook/utils";

export interface StringDag {
  parents: NameAnd<string[]>
  children: NameAnd<string[]>
}
