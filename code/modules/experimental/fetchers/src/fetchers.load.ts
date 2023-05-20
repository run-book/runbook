import { transformToString } from "@runbook/optics";
import { Fetcher, FetcherResult } from "./fetcher";
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
export type WhyNotLoadedAndFetcher<State, C> = WhyNotLoadedAnd<State, Fetcher<State, C>>

export type WhyNotLoadedAndTransforms<State, C> = WhyNotLoadedAnd<State, ErrorsAnd<FetcherResult<State, C>>>
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


export function whichWillLoad<State> ( fs: NameAnd<Fetcher<State, any>> ): ( s: State ) => NameAnd<WhyNotLoadedAndFetcher<State, any>> {
  return s => mapObjValues ( fs, ( f: Fetcher<State, any> ) => {
    let whyNotLoaded: ShouldFetchResult = f.shouldLoad ( s );
    return isFailedShouldFetchResult ( whyNotLoaded ) ? { whyNotLoaded } : { whyNotLoaded, data: f }
  } )
}

export const fetchOne = <State> ( state: State ) => async <C> ( w: WhyNotLoadedAndFetcher<State, C> ): Promise<WhyNotLoadedAndTransforms<State, C>> =>
  mapWhyNotLoadedAndK ( w, f => f.fetch ( w.whyNotLoaded ) ( state ) );

export const fetchAll = async <State, C> ( ws: NameAnd<WhyNotLoadedAndFetcher<State, C>>, state: State ): Promise<NameAnd<WhyNotLoadedAndTransforms<State, C>>> =>
  mapObjValuesK ( ws, fetchOne ( state ) );

export interface TraceFetch<State, C> {
  whyNotLoaded: WhyNotLoadedAndFetcher<State, C>
  transforms?: ErrorsAnd<FetcherResult<State, C>>
}
function mergeIntoTraceFetch<State, C> ( whyNotLoaded: WhyNotLoadedAndFetcher<State, C>, transforms: WhyNotLoadedAndTransforms<State, C> ): TraceFetch<State, C> {
  if ( isFailedShouldFetchResult ( whyNotLoaded.whyNotLoaded ) ) return { whyNotLoaded }
  return { whyNotLoaded, transforms: transforms.data }
}
export async function traceFetch<State, C> ( fs: NameAnd<Fetcher<State, any>>, state: State ): Promise<NameAnd<TraceFetch<State, C>>> {
  const whyNotLoaded: NameAnd<WhyNotLoadedAnd<State, Fetcher<State, any>>> = whichWillLoad ( fs ) ( state )
  const transforms: NameAnd<WhyNotLoadedAnd<State, ErrorsAnd<FetcherResult<State, any>>>> = await fetchAll ( whyNotLoaded, state )
  return merge2Objs ( whyNotLoaded, transforms, mergeIntoTraceFetch )
}
export function traceFetchToString<State, C> ( t: TraceFetch<State, C> ) {
  const whyNotLoaded: WhyNotLoadedAnd<State, Fetcher<State, C>> = t.whyNotLoaded
  const transforms = t.transforms && foldErrors ( t.transforms, ( res: FetcherResult<State, C> ) =>
    ({ tx: transformToString ( res.tx ), otherTxs: res.otherTxs.map ( transformToString ) }), t => ({ errors: t.errors }) as any )
  const result = { whyNotLoaded, transforms }
  return JSON.stringify ( result, null, 2 )
}

export function traceFetchObjToString<State, C> ( t: NameAnd<TraceFetch<State, C>> ) {
  return mapObjValues ( t, traceFetchToString )
}
