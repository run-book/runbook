import { KoaPartialFunction } from "@runbook/koa";
import { Execution, StatusEndpointData } from "@runbook/executors";
import { Cache } from "@runbook/cache";
import { mapObjValues, mapObjValuesK, NameAnd, Primitive } from "@runbook/utils";


export function executeStatusEndpoint<T> ( path: string, cache: Cache<Execution<[ string, T ]>> ): KoaPartialFunction {
  return {
    isDefinedAt: ( { context } ) => {
      let result = context.path === path && context.method === "GET";
      return result;
    },
    apply: async ( { context } ) => {
      const status: NameAnd<StatusEndpointData> = await mapObjValuesK ( cache, async ( { cached: execution, count, lastUpdated } ) => {
        const name = execution.t[ 0 ];
        const params = execution.params;

        const finished = execution.finished;
        // console.log ( 'execution', execution )
        if ( finished && execution.promise ) {
          const p = await execution.promise
          console.log('p', p)

          return { name, finished, count, lastUpdated, params, code: p.code, output: p.output };
        } else
          return { name, finished, count, lastUpdated, params };
      } );
      context.body = JSON.stringify ( status )
      context.status = 200;
    }

  }
}