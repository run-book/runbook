import { Getter } from "./getter";
import { setFn, Setter } from "./setter";
import { Iso } from "./iso";

export type Lens<M, C> = LensR<M, C> | Iso<M, C>

export function isLensR<M, C> ( lens: LensR<M, C> ): lens is LensR<M, C> {
  return lens.get !== undefined && lens.set !== undefined
}
export interface LensR<M, C> extends Getter<M, C>, Setter<M, C> {}

export function composeLens<M, C, GC> ( first: Lens<M, C>, second: Lens<C, GC> ): LensR<M, GC> {
  const setFirst = setFn ( first )
  const setSecond = setFn ( second )
  return {
    get: ( model: M ) => second.get ( first.get ( model ) ),
    set: ( model: M, child: GC ) => setFirst ( model, setSecond ( first.get ( model ), child ) )
  }
}
