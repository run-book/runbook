import { ReverseGet } from "./setter";
import { Getter } from "./getter";

export interface Iso<M, C> extends Getter<M, C>, ReverseGet<M, C>{
  get: ( model: M ) => C
  reverseGet: ( child: C ) => M
}
export function isIso<M, C> ( iso: Iso<M, C> ): iso is Iso<M, C> {
  return iso.get !== undefined && iso.reverseGet !== undefined
}

export function composeIso<M, C, GC> ( first: Iso<M, C>, second: Iso<C, GC> ): Iso<M, GC> {
  return {
    get: ( model: M ) => second.get ( first.get ( model ) ),
    reverseGet: ( child: GC ) => first.reverseGet ( second.reverseGet ( child ) )
  }
}

export function identity<M> (): Iso<M, M> {
  return {
    get: ( model: M ) => model,
    reverseGet: ( child: M ) => child
  }
}