import { Optional } from "./optional";
import { getOptionalFn } from "./getter";
import { setFn, setOptionalFn } from "./setter";
import { flatMap, toArray } from "@runbook/utils";
import { Lens } from "./lens";

export type Traversal<M, C> = TraversalR<M, C> | Optional<M, C>
export interface TraversalR<M, C> {
  modify: ( model: M, f: ( child: C ) => C ) => M
  getAll: ( model: M ) => C[]
}
export function isTraversal<M, C> ( t: Traversal<M, C> ): t is TraversalR<M, C> {
  return (t as any).modify !== undefined
}
export function modifyOptFn<M, C> ( t: Traversal<M, C> ): ( m: M, f: ( c: C ) => C ) => M | undefined {
  if ( isTraversal ( t ) ) return ( m, f ) => t.modify ( m, f )
  const setOpt = setOptionalFn ( t )
  return ( m, f ) => {
    const c = getOptionalFn ( t ) ( m )
    if ( c == undefined ) return m
    const res = setOpt ( m, f ( c ) )
    return res == undefined ? m : res;
  }
}

export function modifyFnOrOriginal<M, C> ( t: Traversal<M, C> ): ( m: M, f: ( c: C ) => C ) => M {
  if ( isTraversal ( t ) ) return ( m, f ) => t.modify ( m, f )
  return ( m, f ) => {
    const c = getOptionalFn ( t ) ( m )
    if ( c === undefined ) return m
    const rest = setOptionalFn ( t ) ( m, f ( c ) )
    return rest === undefined ? m : rest
  }
}


export function composeT<M, C, GC> ( first: TraversalR<M, C>, second: TraversalR<C, GC> ): TraversalR<M, GC> {
  return {
    modify: ( model: M, f: ( child: GC ) => GC ) => first.modify ( model, c => second.modify ( c, f ) ),
    getAll: ( model: M ) => flatMap ( first.getAll ( model ), c => second.getAll ( c ) )
  }
}
export function focusTonOpt<M, C, GC> ( first: TraversalR<M, C>, focus: Optional<C, GC> ): TraversalR<M, GC> {
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

export function focusTonLens<M, C, GC> ( first: TraversalR<M, C>, focus: Lens<C, GC> ): TraversalR<M, GC> {
  const focusGet = focus.get
  const focusSet = setFn ( focus )
  return {
    modify: ( model: M, f: ( child: GC ) => GC ) => first.modify ( model, c => focusSet ( c, f ( focus.get ( c ) ) ) ),
    getAll: ( model: M ) => flatMap ( first.getAll ( model ), c => toArray ( focus.get ( c ) ) )
  }

}