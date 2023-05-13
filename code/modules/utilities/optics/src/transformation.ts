import { HasOptional } from "./optional";
import { mapOptionalOrOriginal, setOptionalOrOriginal } from "./setter";
import { getDescription } from "@runbook/utils";
import { getOptional } from "./getter";


export type TransformCmd<M, C> = TransformSet<M, C> | TransformMap<M, C> | TransformClear<M, C> | TransformCompose<M, C>

//See ARCHITECTURAL_DECISION_LOG for why this exists
export interface TransformCompose<M, C> {
  cmds: TransformCmd<M, C>[]
}
export function isTransformCompose<M, C> ( t: TransformCmd<M, C> ): t is TransformCompose<M, C> {
  return (t as TransformCompose<M, C>).cmds !== undefined
}

export interface TransformSet<M, C> extends HasOptional<M, C> {
  set: C
}
export function isTransformSet<M, C> ( t: TransformCmd<M, C> ): t is TransformSet<M, C> {
  return (t as TransformSet<M, C>).set !== undefined
}
export interface TransformMap<M, C> extends HasOptional<M, C> {
  map: ( c: C ) => C
  default?: C
}
export function isTransformMap<M, C> ( t: TransformCmd<M, C> ): t is TransformMap<M, C> {
  return (t as TransformMap<M, C>).map !== undefined
}
export const processMap = <M, C> ( cmd: TransformMap<M, any> ) => ( m: M ): M => {
  const result = getOptional ( cmd.optional, m )
  const from = result || cmd.default
  const newChild = cmd.map ( from )
  return setOptionalOrOriginal ( cmd.optional, m, newChild )
};

export interface TransformClear<M, C> extends HasOptional<M, C> {
  clear: true
}
export function isTransformClear<M, C> ( t: TransformCmd<M, C> ): t is TransformClear<M, C> {
  return (t as TransformClear<M, C>).clear !== undefined
}


export function applyOneTransformFn<M, C> ( m: M, t: TransformCmd<M, C> ): M {
  if ( isTransformMap ( t ) ) return processMap ( t ) ( m )
  if ( isTransformSet ( t ) ) return mapOptionalOrOriginal ( t.optional ) ( m, () => t.set )
  if ( isTransformClear ( t ) ) return mapOptionalOrOriginal ( t.optional ) ( m, () => undefined as any )
  if ( isTransformCompose ( t ) ) return t.cmds.reduce ( ( m, t ) => applyOneTransformFn ( m, t ), m )
  console.log ( 'isTransformSet', isTransformSet ( t ), (t as any).set )
  console.log ( 'unknown transform', t )
  throw new Error ( 'unknown transform ' + JSON.stringify ( t ) )
}

export function transformToString<State, T> ( t: TransformCmd<State, T> ): string {
  if ( isTransformCompose ( t ) ) return "{" + t.cmds.map ( transformToString ).join ( ',' ) + "}"
  const desc = getDescription ( t.optional, o => `Unknown optional` )
  if ( isTransformMap ( t ) ) return `tx:map(${desc}, ${getDescription ( t.map, o => 'unknownFn' )})`
  if ( isTransformSet ( t ) ) return `tx:set(${desc}, ${JSON.stringify ( t.set )})`
  if ( isTransformClear ( t ) ) return `tx:clear()`
  console.log ( 'isTransformSet', isTransformSet ( t ), (t as any).set )
  console.log ( 'unknown transform', t )
  throw new Error ( 'unknown transform ' + JSON.stringify ( t ) )
}

