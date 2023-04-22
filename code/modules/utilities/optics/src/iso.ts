import { ReverseGet } from "./setter";
import { Getter } from "./getter";
import { addDescription } from "@runbook/utils";

export interface Iso<M, C> extends Getter<M, C>, ReverseGet<M, C> {
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
  return addDescription ( {
    get: ( model: M ) => model,
    reverseGet: ( child: M ) => child
  }, () =>'identity' )
}

export function iso2<T1, T2, Res> ( to: ( t1: T1, t2: T2 ) => Res, from: ( res: Res ) => [ T1, T2 ] ): Iso<[ T1, T2 ], Res> {
  return {
    get: ( [ t1, t2 ] ) =>
      to ( t1, t2 ),
    reverseGet: from
  }
}