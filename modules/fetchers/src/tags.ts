import { flatMap, KleisliWithErrors, NameAnd, safeArray } from "@runbook/utils";
import { focusQuery, getOptional, Getter, opticsParserO, Optional, TransformCmd, TransformSet } from "@runbook/optics";
import { ShouldFetchResult } from "./shouldFetch";

export type Tag = string | number | boolean | undefined
export type Tags = Tag[]
export type TagHolder = NameAnd<Tags>
export type TagHolderOpt<State> = Optional<State, TagHolder>
export type TagsGetterFn<State> = ( state: State ) => Tags | undefined
export type TagGetterFn<State> = ( state: State ) => Tag


export function recordedTags<State> ( optional: TagHolderOpt<State>, name: string ): TagsGetterFn<State> {
  return state => {
    const tagHolder = getOptional ( optional, state )
    if ( tagHolder === undefined ) return undefined
    const tags = tagHolder[ name ]
    return tags
  }
}

export const getTagsGetterFn = <State> ( fns: TagGetterFn<State>[] ): TagsGetterFn<State> =>
  state => fns.map ( fn => fn ( state ) );

export const getTagsGetterFnFromPath = <State> ( paths: string[] ): TagsGetterFn<State> => {
  const optionals = paths.map ( opticsParserO<State, Tag> )
  return state => optionals.map ( optional => getOptional ( optional, state ) )
}
export function tagsEqualsWithMessagesIfNot ( recordedTags: Tags, existingTags: Tags ): string[] {
  if ( recordedTags.length !== existingTags.length ) return [ 'lengths differ' ]
  const messages: string[] = flatMap ( recordedTags, ( recordedTag, index ) => {
    const existingTag = existingTags[ index ]
    if ( recordedTag === existingTag ) return []
    return [ `tag at index ${index} differs: ${recordedTag} !== ${existingTag}. Types ${typeof recordedTag} & ${typeof existingTag}` ]
  } )
  return messages
}

export const shouldLoadForTags = <State> ( recordedTags: TagsGetterFn<State>, existingTags: TagsGetterFn<State> ) => ( state: State ): ShouldFetchResult => {
  const recorded = recordedTags ( state )
  const existing = existingTags ( state )
  if ( recorded === undefined ) return { willFetchBecause: [ 'no recorded tags: this is the first time' ] }
  if ( existing === undefined ) return { willNotFetchBecause: [ 'no existing tags' ] }
  const mismatches = tagsEqualsWithMessagesIfNot ( recorded, existing )
  if ( mismatches.length > 0 ) return { willFetchBecause: mismatches }
  return { willNotFetchBecause: [ `tags match ${recorded}` ] }
};

export function transformTagsAfterLoad<State> ( tagHolderOpt: Optional<State, TagHolder>, name: string, existingTags: Tags ): TransformSet<State, Tags> {
  const optional = focusQuery(tagHolderOpt, name)
  return {    optional,set: existingTags }
}

export function tagFetcher<State,C> ( tagHolderOpt: TagHolderOpt<State>, name: string, loader:  KleisliWithErrors<State, TransformCmd<State, C>[]> ) {
}