import { Optional } from "@runbook/optics";
import { addCmd, newStore, SimpleMiddleware, startProcessing, Store } from "@runbook/store";
import { getDescription, parseJson } from "@runbook/utils";

export function poll<S> ( store: Store<S>, interval: number = 1000 ) {
  setInterval ( () => {
    console.log ( 'poll adding command', interval )
    addCmd ( store ) ( { null: true } );
  }, interval )
}

export function pollMiddleware<S, C> ( requestInfo: RequestInfo, requestInit: RequestInit | undefined, target: Optional<S, C>, fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response>, interval: number ): SimpleMiddleware<S> {
  return {
    process: async ( s, onError ) =>
      new Promise ( ( resolve, reject ) => {
        setTimeout ( async () => {
          try {
            const response = await fetch ( requestInfo, requestInit )
            const set = parseJson ( await response.json () )
            return resolve ( [ { set, optional: target } ] )
          } catch ( e ) {
            onError ( `${JSON.stringify ( { requestInfo, requestInit } )} target ${getDescription ( target )}`, e )
            return resolve ( [ { null: true } ] )
          }
        }, interval )
      } )
  }
}
export function pollStore<S, T> ( initial: S, requestInfo: RequestInfo, requestInit: RequestInit | undefined, target: Optional<S, T>, fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response>, interval: number = 1000 ) {
  const store = newStore ( initial, 100, pollMiddleware ( requestInfo, requestInit, target, fetch, 1000 ) )
  startProcessing ( store )
  addCmd ( store ) ( { null: true } )//kick off the polling
  return store
}