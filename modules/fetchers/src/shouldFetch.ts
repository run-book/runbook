import { flatMap, getDescription } from "@runbook/utils";
import { getOptional, Optional } from "@runbook/optics";

export type ShouldFetchFn<State> = ( state: State ) => ShouldFetchResult
export type ShouldFetchResult = SuccessfullShouldFetchResult | FailedShouldFetchResult
export interface SuccessfullShouldFetchResult {
  willFetchBecause?: string[]
}
export function isSuccessfulShouldFetchResult ( result: ShouldFetchResult ): result is SuccessfullShouldFetchResult {
  return (result as any).willFetchBecause !== undefined
}
export interface FailedShouldFetchResult {
  willNotFetchBecause?: string[]
}
export function isFailedShouldFetchResult ( result: ShouldFetchResult ): result is FailedShouldFetchResult {
  return (result as any).willNotFetchBecause !== undefined
}
export function composeShouldFetchResult ( results: ShouldFetchResult[] ): ShouldFetchResult {
  const willFetchBecause = flatMap ( results, result => {
    if ( isSuccessfulShouldFetchResult ( result ) ) return result.willFetchBecause
    return []
  } )
  const willNotFetchBecause = flatMap ( results, result => {
    if ( isFailedShouldFetchResult ( result ) ) return result.willNotFetchBecause
    return []
  } )
  if ( willFetchBecause.length > 0 ) return { willFetchBecause }
  return { willNotFetchBecause }
}

export function composeShouldFetch<State> ( fns: ShouldFetchFn<State>[] ): ShouldFetchFn<State> {
  return state => composeShouldFetchResult ( fns.map ( fn => fn ( state ) ) )
}

export function shouldFetchAlways<State> ( state: State ): ShouldFetchResult {
  return { willFetchBecause: [ 'always' ] }
}

export function shouldFetchNever<State> ( state: State ): ShouldFetchResult {
  return { willNotFetchBecause: [ 'never' ] }
}
export const shouldFetchIfUndefined = <State> ( optional: Optional<State, any> ) => ( state: State ): ShouldFetchResult => {
  const value = getOptional ( optional, state )
  const description = getDescription ( optional, o => 'unknown' )
  if ( value === undefined ) return { willFetchBecause: [ `value at (${description}) is undefined` ] }
  return { willNotFetchBecause: [ `value at (${description}) is defined` ] }
};

