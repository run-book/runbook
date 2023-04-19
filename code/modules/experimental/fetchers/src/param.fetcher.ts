import { KleisliWithErrors, mapErrors, mapObjValues, NameAnd } from "@runbook/utils";
import { focusQuery, getOptional, opticsParserO, Optional, TransformCmd, TransformSet } from "@runbook/optics";
import { ShouldFetchResult } from "./shouldFetch";
import { Fetcher } from "./fetcher";
import { Param, ParamGetterFn, Params, paramsEqualsWithMessagesIfNot, ParamsGetterFn } from "@runbook/loaders";


export type TagHolder = NameAnd<Params>
export type TagHolderOpt<State> = Optional<State, TagHolder>


export function recordedTags<State> ( optional: TagHolderOpt<State>, name: string ): ParamsGetterFn<State> {
  return state => {
    const tagHolder = getOptional ( optional, state )
    if ( tagHolder === undefined ) return undefined
    const tags = tagHolder[ name ]
    return tags
  }
}

export const getTagsGetterFn = <State> ( fns: NameAnd<ParamGetterFn<State>> ): ParamsGetterFn<State> =>
  state => mapObjValues ( fns, fn => fn ( state ) );

export const getTagsGetterFnFromPath = <State> ( paths: NameAnd<string> ): ParamsGetterFn<State> => {
  const optionals = mapObjValues ( paths, opticsParserO<State, Param> )
  return state => mapObjValues ( optionals, optional => getOptional ( optional, state ) )
}


export interface ExistingAndRecordedTags {
  existing?: Params
  recorded?: Params
}
export function isExistingTags ( result: ShouldFetchResult & ExistingAndRecordedTags ): result is ShouldFetchResult & ExistingAndRecordedTags {
  return (result as any).existingTags !== undefined
}
export const shouldLoadForTags = <State> ( name: string, recordedTags: ParamsGetterFn<State>, existingTags: ParamsGetterFn<State> ) => ( state: State ): ShouldFetchResult & ExistingAndRecordedTags => {
  const recorded = recordedTags ( state )
  const existing = existingTags ( state )
  if ( recorded === undefined ) return { willFetchBecause: [ 'no recorded tags: this is the first time' ] }
  if ( existing === undefined ) return { willNotFetchBecause: [ 'no existing tags' ] }
  const mismatches = paramsEqualsWithMessagesIfNot ( name,
    recorded, existing )
  if ( mismatches.length > 0 ) return { willFetchBecause: mismatches }
  return { willNotFetchBecause: [ `tags match ${recorded}` ], existing, recorded }
};

export function transformTagsAfterLoad<State> ( tagHolderOpt: Optional<State, TagHolder>, name: string, existingTags: Params ): TransformSet<State, Params> {
  const optional = focusQuery ( tagHolderOpt, name )
  return { optional, set: existingTags }
}

export function paramsFetcher<State, C> ( tagHolderOpt: TagHolderOpt<State>, name: string, paramPaths: NameAnd<string>, loader: KleisliWithErrors<Params, TransformCmd<State, C>> ): Fetcher<State, C> {
  const shouldLoad = shouldLoadForTags ( name, recordedTags ( tagHolderOpt, name ), getTagsGetterFnFromPath ( paramPaths ) )
  const fetch = shouldLoad => async state => {
    const existing = isExistingTags ( shouldLoad ) && shouldLoad.existing
    return mapErrors ( await loader ( existing ), tx => {
      if ( existing === undefined ) return { errors: [ 'no existing tags - this is a violation of an assumption' ] }
      return { tx, otherTxs: [ transformTagsAfterLoad ( tagHolderOpt, name, existing ) ] }
    } );
  }
  return { shouldLoad, fetch }
}