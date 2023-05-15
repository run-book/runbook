import { RunbookComponent } from "@runbook/runbook_state";
import { StatusEndpointData } from "@runbook/executors";
import { mapObjToArray, NameAnd } from "@runbook/utils";
import { Store } from "@runbook/store";
import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe } from "@runbook/storybook";

export function displayExecutors<S> ( executorStore: Store<NameAnd<StatusEndpointData>> ): RunbookComponent<S, any> {
  return st => ( { id } ) => {
    const statusData = useSyncExternalStore ( subscribe ( executorStore ), getSnapshot ( executorStore ) )
    return <><h1>Executors</h1>
      <table id={id}>
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Finished</th>
          <th>Count</th>
        </tr>
        </thead>
        <tbody>
        {mapObjToArray ( statusData, ( { finished, count, name }, id ) =>
          <tr key={id}>
            <td>{id}</td>
            <td>{name}</td>
            <td>{finished}</td>
            <td>{count}</td>
          </tr> )}
        </tbody>
      </table>
    </>
  }

}