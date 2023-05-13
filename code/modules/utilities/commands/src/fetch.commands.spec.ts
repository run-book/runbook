import { FetchCommand, fetchMiddleware } from "./fetch.commands";
import { focusQuery, identity, transformToString } from "@runbook/optics";

interface TestState {
  fetchCommands: FetchCommand[]
  a?: string[]
}
const fetchOpt = focusQuery ( identity<TestState> (), 'fetchCommands' )
function setUp () {
  const fetch = async ( info: RequestInfo, init?: RequestInit ) =>
    ({ json: async () => `{"res":"${info} ${init?.method}"}` })
  const middleware = fetchMiddleware ( fetchOpt, fetch )
  return middleware
}
describe ( "fetchMiddleware", () => {
  it ( "should process fetch commands, getting data and creating commands that add to the situation at the path", async () => {
    const middleware = setUp ()
    const state: TestState = {
      fetchCommands: [ { requestInfo: 'someUrl', requestInit: { method: 'get' }, target: 'a' } ]
    }
    let onError = jest.fn ();
    const commands = await middleware.process ( state.fetchCommands, onError )
    expect ( onError ).not.toHaveBeenCalled ()
    expect ( commands.map ( transformToString ) ).toEqual ([
      "tx:set(a, {\"res\":\"someUrl get\"})"
    ])
  } )
} )