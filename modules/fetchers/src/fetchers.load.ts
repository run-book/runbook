import { TransformCmd, transformToString } from "@runbook/optics";
import { Fetcher } from "./fetcher";
import { ErrorsAnd, foldErrors, mapObjValues, mapObjValuesK, merge2Objs, NameAnd } from "@runbook/utils";
import { isFailedShouldFetchResult, isSuccessfulShouldFetchResult, ShouldFetchResult } from "./shouldFetch";

/* The 'why didn't it load' question will occur again and again. This code is a way to answer that question.
 * It is thus more complex than it needs to be to just load the data. But we REALLY want to know why it didn't load.
 * */


/** The T might be the fetcher, it might be the transformation...this is something that can be mapped over */
export interface WhyNotLoadedAnd<State, T> {
  /** If this is empty the fetcher loaded. If it is not empty, this is why not */
  whyNotLoaded: ShouldFetchResult
  data?: T
}

/**Functor. If 'wont load' then map will do nothing. If it can load. map will work */
export type WhyNotLoadedAndFetcher<State> = WhyNotLoadedAnd<State, Fetcher<State, any>>

export type WhyNotLoadedAndTransforms<State> = WhyNotLoadedAnd<State, ErrorsAnd<TransformCmd<State, any>[]>>
export function mapWhyNotLoadedAnd<State, T, T1> ( w: WhyNotLoadedAnd<State, T>, f: ( t: T ) => T1 ): WhyNotLoadedAnd<State, T1> {
  let whyNotLoaded = w.whyNotLoaded;
  return isSuccessfulShouldFetchResult ( whyNotLoaded ) ? { whyNotLoaded, data: f ( w.data! ) } : { whyNotLoaded };
}

export async function mapWhyNotLoadedAndK<State, T, T1> ( w: WhyNotLoadedAnd<State, T>, f: ( t: T ) => Promise<ErrorsAnd<T1>> ): Promise<WhyNotLoadedAnd<State, ErrorsAnd<T1>>> {
  let whyNotLoaded = w.whyNotLoaded;
  if ( isFailedShouldFetchResult ( whyNotLoaded ) ) return { whyNotLoaded };
  const data: ErrorsAnd<T1> = await f ( w.data! )
  return { whyNotLoaded, data }

}


export function whichWillLoad<State> ( fs: NameAnd<Fetcher<State, any>> ): ( s: State ) => NameAnd<WhyNotLoadedAndFetcher<State>> {
  return s => mapObjValues ( fs, ( f: Fetcher<State, any> ) => {
    let whyNotLoaded: ShouldFetchResult = f.shouldLoad ( s );
    return isFailedShouldFetchResult ( whyNotLoaded ) ? { whyNotLoaded } : { whyNotLoaded, data: f }
  } )
}

export const fetch = <State> ( state: State ) => async ( w: WhyNotLoadedAndFetcher<State> ): Promise<WhyNotLoadedAndTransforms<State>> =>
  mapWhyNotLoadedAndK ( w, f => f.fetch ( w.whyNotLoaded ) ( state ) );

export const fetchAll = async <State> ( ws: NameAnd<WhyNotLoadedAndFetcher<State>>, state: State ): Promise<NameAnd<WhyNotLoadedAndTransforms<State>>> =>
  mapObjValuesK ( ws, fetch ( state ) );

export interface TraceFetch<State> {
  whyNotLoaded: WhyNotLoadedAndFetcher<State>
  transforms?: ErrorsAnd<TransformCmd<State, any>[]>
}
function mergeIntoTraceFetch<State> ( whyNotLoaded: WhyNotLoadedAndFetcher<State>, transforms: WhyNotLoadedAndTransforms<State> ): TraceFetch<State> {
  if ( isFailedShouldFetchResult ( whyNotLoaded.whyNotLoaded ) ) return { whyNotLoaded }
  return { whyNotLoaded, transforms: transforms.data }
}
export async function traceFetch<State> ( fs: NameAnd<Fetcher<State, any>>, state: State ): Promise<NameAnd<TraceFetch<State>>> {
  const whyNotLoaded = whichWillLoad ( fs ) ( state )
  const transforms = await fetchAll ( whyNotLoaded, state )
  return merge2Objs ( whyNotLoaded, transforms, mergeIntoTraceFetch )
}
export function traceFetchToString<State> ( t: TraceFetch<State> ) {
  const whyNotLoaded = t.whyNotLoaded
  const transforms = foldErrors ( t.transforms, ts => ts.map ( transformToString ), t => t.errors )
  const result = { whyNotLoaded, transforms }
  return JSON.stringify ( result, null, 2 )
}

export function traceFetchObjToString<State> ( t: NameAnd<TraceFetch<State>> ) {
  return mapObjValues ( t, traceFetchToString )
}
