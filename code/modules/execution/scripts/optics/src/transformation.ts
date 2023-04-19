import { HasOptional } from "./optional";
import { mapOptionalOrOriginal } from "./setter";
import { getDescription } from "@runbook/utils";


export type TransformCmd<M, C> = TransformSet<M, C> | TransformMap<M, C> | TransformClear<M, C>

export interface TransformSet<M, C> extends HasOptional<M, C> {
  set: C
}
export function isTransformSet<M, C> ( t: TransformCmd<M, C> ): t is TransformSet<M, C> {
  return (t as TransformSet<M, C>).set !== undefined
}
export interface TransformMap<M, C> extends HasOptional<M, C> {
  map: ( c: C ) => C
}
export function isTransformMap<M, C> ( t: TransformCmd<M, C> ): t is TransformMap<M, C> {
  return (t as TransformMap<M, C>).map !== undefined
}
export interface TransformClear<M, C> extends HasOptional<M, C> {
  clear: true
}
export function isTransformClear<M, C> ( t: TransformCmd<M, C> ): t is TransformClear<M, C> {
  return (t as TransformClear<M, C>).clear !== undefined
}

export function applyOneTransformFn<M, C> ( m: M, t: TransformCmd<M, C> ): M {
  if ( isTransformMap ( t ) ) mapOptionalOrOriginal ( t.optional ) ( m, t.map )
  if ( isTransformSet ( t ) ) mapOptionalOrOriginal ( t.optional ) ( m, () => t.set )
  if ( isTransformClear ( t ) ) mapOptionalOrOriginal ( t.optional ) ( m, () => undefined )
  throw new Error ( 'unknown transform' + JSON.stringify ( t ) )
}

export function transformToString<State, T> ( t: TransformCmd<State, T> ): string {
  const desc = getDescription ( t.optional, o => `Unknown optional` )
  if ( isTransformMap ( t ) ) return `tx:map(${desc}, ${getDescription ( t.map, o => 'unknownFn' )})`
  if ( isTransformSet ( t ) ) return `tx:set(${desc}, ${JSON.stringify ( t.set )})`
  if ( isTransformClear ( t ) ) return `tx:clear()`
  throw new Error ( 'unknown transform' + JSON.stringify ( t ) )
}

