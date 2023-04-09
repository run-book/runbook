/** A partial klesli function. shouldFetch is human readable reasons why not */
import { HasDescription, KleisliWithErrors } from "@runbook/utils";
import { TransformCmd } from "@runbook/optics";
import { ShouldFetchFn, ShouldFetchResult } from "./shouldFetch";

/** Kind of a partial function
 *
 * However we really want to know 'why' it did or didn't load.
 * And we don't want to waste CPU cycles recalculating the same thing over and over so we
 * pass the ShouldFetchResult to the fetch function. They can have 'payload' in it.
 *
 * It's hard in typescript to have the payload typed (possible, but very very busy code) so we just
 * pass the ShouldFetchResult and let the fetcher decide what to do with it.
 */
export interface Fetcher<State, C> extends HasDescription {
  shouldLoad: ShouldFetchFn<State>
  fetch: FetcherLoadFn<State, C>
}

export type FetcherLoadFn<State, C> = ( f: ShouldFetchResult ) => KleisliWithErrors<State, TransformCmd<State, C>[]>
