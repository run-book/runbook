import { Middleware } from "@runbook/store";
import { opticsParserO, Optional } from "@runbook/optics";
import { mapKWithNotifyOnError, parseJson } from "@runbook/utils";


export interface FetchCommand {
  requestInfo: RequestInfo
  requestInit?: RequestInit
  /** A 'path' to where we put the data in the state */
  target: string
}

interface Response{
  json: () => Promise<any>
}

export function fetchMiddleware<S> ( commandOpt: Optional<S, FetchCommand[]>, fetch: ( info: RequestInfo, init?: RequestInit ) => Promise<Response> ): Middleware<S, any> {
  return {
    optional: commandOpt,
    process: async ( commands: FetchCommand[], onError ) =>
      mapKWithNotifyOnError ( commands, async c => {
        let optional = opticsParserO<S, any> ( c.target );
        const response = await fetch ( c.requestInfo, c.requestInit )
        const set = parseJson ( await response.json () )
        return { set, optional }
      }, onError )
  }

}