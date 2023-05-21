import { KoaPartialFunction } from "@runbook/koa";
import { Execution, StatusEndpointData } from "@runbook/executors";
import { Cache } from "@runbook/cache";
import { mapObjValues, NameAnd, Primitive } from "@runbook/utils";


export function executeStatusEndpoint<T> ( path: string, cache: Cache<Execution<[ string, T ]>> ): KoaPartialFunction {
  return {
    isDefinedAt: ( { context } ) => {
      let result = context.path === path && context.method === "GET";
      return result;
    },
    apply: async ( { context } ) => {
      const status: NameAnd<StatusEndpointData> = mapObjValues ( cache, ( { cached, count, lastUpdated } ) => {
        const name = cached.t[ 0 ];
        const params = cached.params;

        const finished = cached.finished;
        return { name, finished, count, lastUpdated, params };
      } );
      context.body = JSON.stringify ( status )
      context.status = 200;
    }

  }
}