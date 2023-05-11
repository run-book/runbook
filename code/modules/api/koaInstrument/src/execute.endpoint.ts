import { KoaPartialFunction } from "@runbook/api_koa";
import { Execution } from "@runbook/executors";
import { Cache, CacheDetails, cacheGet, CacheOptions } from "@runbook/cache";
import { Params } from "@runbook/loaders";
import { composeNameAndValidators, ErrorsAnd, isErrors, NameAndValidator, toErrorsAnd, validateArray, validateChild, validateNameAnd, validatePrimitive, validateString } from "@runbook/utils";

interface NameAndParams {
  name: string
  params: Params
}
export interface ExecuteBody {
  execute: NameAndParams[]
}

const validateExecuteBody: NameAndValidator<ExecuteBody> =
        validateChild ( "execute",
          validateArray ( composeNameAndValidators (
            validateChild ( "name", validateString () ),
            validateChild ( 'params', validateNameAnd ( validatePrimitive () ) ) ) ) )

interface TAndNameParams<T> {
  t: T
  name: string
  params: Params
}

export function cacheStatus<T> ( ts: CacheDetails<Execution<T>>[] ) {
  return ts.map ( ( cd: CacheDetails<Execution<T>> ) => {
    const id = cd.id
    let cacheDetails = cd.cacheDetails;
    const ex: Execution<T> = cacheDetails.cached
    const params = ex.params
    return { id, cacheDetails }
  } )
}
export function executeEndpoint<T> ( path: string, cacheOptions: CacheOptions,
                                     nameToT: ( name: string ) => T,
                                     cache: Cache<Execution<[ string, T ]>>,
                                     execute: ( name: string, s: T ) => ( params: Params ) => Execution<[ string, T ]> ): KoaPartialFunction {
  return {
    isDefinedAt: ( { context } ) => context.path === path && context.method === "POST",
    apply: async ( { context } ) => {
      const body: ExecuteBody = context.request.body;
      console.log('body', body)
      const validated = validateExecuteBody ( '' ) ( body );
      if ( validated.length > 0 ) {
        context.status = 400;
        context.body = JSON.stringify ( validated );
        return
      }
      const tAndParams: ErrorsAnd<TAndNameParams<T>[]> = toErrorsAnd ( body.execute.map ( ( e, i ) => {
        const t = nameToT ( e.name )
        if ( t ) {
          let paramsAndT: TAndNameParams<T> = { params: e.params, t, name: e.name };
          return paramsAndT
        }
        return { errors: [ `[${i}] No instrument named ${e.name}` ] }
      } ) )
      if ( isErrors ( tAndParams ) ) {
        context.status = 400
        context.body = JSON.stringify ( tAndParams )
        return
      }
      const status =
              tAndParams.map ( ( { t, params, name } ) => {
                let cacheDetails = cacheGet ( cacheOptions, cache ) ( params, 1000, execute ( name, t ) );
                const execution: Execution<[ string, T ]> = cacheDetails.cacheDetails.cached
                const id = cacheDetails.id
                return { id, name, params, finished: execution.finished };
              } )
      context.status = 200
      context.body = JSON.stringify ( status )
    }

  }
}