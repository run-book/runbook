import { KoaPartialFunction } from "@runbook/api_koa";
import { Execution } from "@runbook/executors";
import { Cache } from "@runbook/cache";
import { mapObjValues } from "@runbook/utils";

export function executeStatusEndpoint<T> ( path: string, cache: Cache<Execution<[ string, T ]>> ): KoaPartialFunction {
  return {
    isDefinedAt: ( { context } ) => context.path === path && context.method === "GET",
    apply: async ( { context } ) => {
      const status = mapObjValues ( cache, ( { cached, count, lastUpdated } ) => {
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