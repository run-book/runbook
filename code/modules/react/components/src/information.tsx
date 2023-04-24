import { RunbookComponent } from "@runbook/runbook_state";

export function information<S extends any> ( title: string, info: string ): RunbookComponent<S, any> {
  return ( st: any ) => props => {
    return <div>
      <h1>{title}</h1>
      <pre>{info}</pre>
    </div>

  }
}