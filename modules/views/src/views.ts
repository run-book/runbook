import { NameAnd } from "@runbook/utils";
import { Binding } from "@runbook/bindings";

export type Fetchers = NameAnd<Fetcher>

export interface IfTrue {
  "type": string,
  "name": string,
  "params": NameAnd<string> | '*'
  "addTo": any
}
export interface IfTrueBound extends IfTrue{
  binding: Binding
}
export interface Fetcher {
  condition: any;
  ifTrue: IfTrue;
}
export interface View {
  type: string;
  description: string | string[],
  usage: string | string[],
  preconditions: string | string[],
  fetchers: Fetchers
}