import { Optional, TransformCmd, TransformNull } from "@runbook/optics";
import { addCmd, SimpleMiddleware, Store } from "@runbook/store";
import { collect, flatten, getDescription, parseJson } from "@runbook/utils";

const debug = console.log//require ( 'debug' ) ( 'poll' )

export interface PollCommand<S, C> extends TransformNull<S, C> {
  poll: true
  requestInfo: RequestInfo,
  requestInit: RequestInit | undefined,
  optional: Optional<S, C>
}
export function isPollCommand<S, C> ( cmd: TransformNull<S, C> ): cmd is PollCommand<S, C> {
  return (cmd as PollCommand<S, C>).poll !== undefined
}
export function poll<S, C> ( store: Store<S>, requestInfo: RequestInfo, requestInit: RequestInit | undefined, target: Optional<S, C>, interval: number = 1000 ) {
  setInterval ( () => {
    debug ( 'poll adding {null:true} command', interval )
    let pollCommand: PollCommand<S, any> = { null: true, poll: true, requestInfo, requestInit, optional: target };
    addCmd ( store ) ( pollCommand );
  }, interval )
}

async function processOnePollCommand<S, C> ( cmd: PollCommand<S, C>, fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response>, onError: ( c: any, e: any ) => Promise<void> ) {
  const { requestInfo, requestInit, optional: target, poll } = cmd
  try {
    debug ( 'pollMiddleware', cmd )
    const response = await fetch ( requestInfo, requestInit )
    let json = await response.text ();
    debug ( 'pollMiddleware - json', json )
    const set = parseJson ( json )
    debug ( 'pollMiddleware - response', getDescription ( target ), set )
    return [ { set, optional: target } ]
  } catch ( e ) {
    debug ( 'pollMiddleware - error', requestInfo, requestInit )
    debug ( 'pollMiddleware - error', e )
    onError ( `${JSON.stringify ( { requestInfo, requestInit } )} target ${getDescription ( target )}`, e )
    return []
  }
}
export function pollMiddleware<S> ( fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response> ): SimpleMiddleware<S> {
  return {
    process: async ( s, cmds, onError ) => {
      const result: TransformCmd<S, any>[] = flatten ( await Promise.all ( collect ( cmds, isPollCommand ).map ( async cmd => {
        return await processOnePollCommand ( cmd, fetch, onError );
      } ) ) )
      return result
    }
  }
}
// export function pollStore<S, T> ( initial: S, requestInfo: RequestInfo, requestInit: RequestInit | undefined, target: Optional<S, T>, fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response>, interval: number = 1000 ) {
//   debug ( 'pollStore', requestInit, requestInfo, target )
//   const store = newStore ( initial, 100, pollMiddleware ( fetch, 1000 ) )
//   startProcessing ( store )
//   addCmd ( store ) ( { null: true } )//kick off the polling
//   return store
// }