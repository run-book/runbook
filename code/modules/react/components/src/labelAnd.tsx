import { display, RunbookComponent } from "@runbook/runbook_state";
import * as Console from "console";

export function labelAnd<S, T> ( label: string, r: RunbookComponent<S, T> ): RunbookComponent<S, T> {
  return st => props =>
    <>
      <dt id={`${props.id}.label`}><label htmlFor={props.id}>{label}</label></dt>
      <dd>{display ( st, props, r )}</dd>
    </>
}

