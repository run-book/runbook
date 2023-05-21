import { KoaPartialFunction } from "@runbook/koa";
import { Execution } from "@runbook/executors";
import { Cache, CacheDetails, cacheGet, CacheOptions } from "@runbook/cache";
import { Params } from "@runbook/loaders";
import { composeNameAndValidators, ErrorsAnd, flatten, isErrors, mapObjToArray, mapObjValues, NameAnd, NameAndValidator, safeObject, validateChild, validateNameAnd, validatePrimitive, validateString } from "@runbook/utils";

interface NameAndParams {
  name: string
  params: Params
}
export interface ExecuteBody {
  execute: NameAnd<NameAndParams>
}

const validateExecuteBody: NameAndValidator<ExecuteBody> =
        validateChild ( "execute",
          validateNameAnd ( composeNameAndValidators (
            validateChild ( "name", validateString () ),
            validateChild ( 'params', validateNameAnd ( validatePrimitive () ) ) ) ) )

interface TAndNameParams<T> {
  t: T
  name: string
  params: Params
}

export const cacheStatus = <T> ( ts: CacheDetails<Execution<T>>[] ) => ts.map ( ( cd: CacheDetails<Execution<T>> ) => {
  const id = cd.cacheId
  let cacheDetails = cd.cacheDetails;
  const ex: Execution<T> = cacheDetails.cached
  const params = ex.params
  return { id, cacheDetails }
} );
export function executeEndpoint<T> ( path: string, cacheOptions: CacheOptions,
                                     nameToT: ( name: string ) => T,
                                     cache: Cache<Execution<[ string, T ]>>,
                                     execute: ( name: string, s: T ) => ( params: Params ) => Execution<[ string, T ]> ): KoaPartialFunction {
  return {
    isDefinedAt: ( { context } ) => context.path === path && context.method === "POST",
    apply: async ( { context } ) => {
      const body: ExecuteBody = context.request.body;
      console.log('body', typeof body, JSON.stringify(body))
      const validated = validateExecuteBody ( '' ) ( body );
      if ( validated.length > 0 ) {
        context.status = 400;
        context.body = JSON.stringify ( validated );
        console.log('Failed validation', validated)
        return
      }
      const idToErrorsAndTAndParams: NameAnd<ErrorsAnd<TAndNameParams<T>>> = mapObjValues ( safeObject ( body.execute ), (( e, name, i ) => {
        const t = nameToT ( e.name )
        if ( t ) {
          let paramsAndT: TAndNameParams<T> = { params: e.params, t, name: e.name };
          return paramsAndT
        }
        return { errors: [ `[${i}] No instrument named ${e.name}` ] }
      }) )
      const allErrors = flatten ( mapObjToArray ( idToErrorsAndTAndParams, ( e, name ) => isErrors ( e ) ? e.errors : [] ) )
      if ( allErrors.length > 0 ) {
        context.status = 400
        console.log('Failed instrument matching', idToErrorsAndTAndParams)
        context.body = JSON.stringify ( idToErrorsAndTAndParams )
        return
      }
      const idToTAndParams: NameAnd<TAndNameParams<T>> = idToErrorsAndTAndParams as any
      const status =
              mapObjValues ( idToTAndParams, ( { t, params, name }, id ) => {
                let { cacheId, cacheDetails } = cacheGet ( cacheOptions, cache ) ( params, 1000, execute ( name, t ) );
                const execution: Execution<[ string, T ]> = cacheDetails.cached
                return { id, cacheId, name, params, finished: execution.finished };
              } )
      console.log('status', status)
      context.status = 200
      context.body = JSON.stringify ( status )
    }
  }
}