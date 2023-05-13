import { RunbookComponent } from "@runbook/runbook_state";
import { StatusEndpointData } from "@runbook/executors";
import { mapObjToArray, NameAnd, safeObject } from "@runbook/utils";

export function displayExecutors<S> (): RunbookComponent<S, NameAnd<StatusEndpointData>> {
  return st => ( { id, focusedOn } ) => {
    const statusData = safeObject ( focusedOn )
    return <><h1>Executors</h1>
      <table>
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