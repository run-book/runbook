import { RunbookComponent } from "@runbook/runbook_state";
import { StatusEndpointData } from "@runbook/executors";
import { getDescription, mapObjToArray, NameAnd } from "@runbook/utils";
import { getOptional } from "@runbook/optics";

const debug = console.log//require ( 'debug' ) ( 'executors' );

export function displayExecutors<S> (): RunbookComponent<S, NameAnd<StatusEndpointData>> {
  return st => ( { id, focusedOn } ) => {
    debug ( 'displayExecutors - id', id )
    const statusData = focusedOn || {}
    debug ( 'displayExecutors -state', st.state )
    debug ( 'displayExecutors -opt', getDescription ( st.opt ) )
    debug ( 'displayExecutors -from opt',  getOptional(st.opt, st.state)  )
    debug ( 'displayExecutors -statusData', statusData )
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