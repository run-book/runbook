import { Optional } from "./optional";
import { getOptionalFn } from "./getter";
import { setFn, setOptionalFn } from "./setter";
import { flatMap, toArray } from "@runbook/utils";
import { Lens } from "./lens";

export interface Traversal<M, C> {
  modify: ( model: M, f: ( child: C ) => C ) => M
  getAll: ( model: M ) => C[]
}
export function composeT<M, C, GC> ( first: Traversal<M, C>, second: Traversal<C, GC> ): Traversal<M, GC> {
  return {
    modify: ( model: M, f: ( child: GC ) => GC ) => first.modify ( model, c => second.modify ( c, f ) ),
    getAll: ( model: M ) => flatMap ( first.getAll ( model ), c => second.getAll ( c ) )
  }
}
export function focusTonOpt<M, C, GC> ( first: Traversal<M, C>, focus: Optional<C, GC> ): Traversal<M, GC> {
  const focusGetter = getOptionalFn ( focus )
  const focusSetter = setOptionalFn ( focus )
  return {
    modify: ( model: M, f: ( child: GC ) => GC ) => first.modify ( model, c => {
      const gc = focusGetter ( c )
      if ( gc == undefined ) return c
      const res = focusSetter ( c, f ( gc ) )
      return res === undefined ? c : res;
    } ),
    getAll: ( model: M ) => flatMap ( first.getAll ( model ), c => toArray ( focusGetter ( c ) ) )
  }
}

export function focusTonLens<M, C, GC> ( first: Traversal<M, C>, focus: Lens<C, GC> ): Traversal<M, GC> {
  const focusGet = focus.get
  const focusSet = setFn ( focus )
  return {
    modify: ( model: M, f: ( child: GC ) => GC ) => first.modify ( model, c => focusSet ( c, f ( focus.get ( c ) ) ) ),
    getAll: ( model: M ) => flatMap ( first.getAll ( model ), c => toArray ( focus.get ( c ) ) )
  }

}