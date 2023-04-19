import { getOptional, getOptionalFn } from "./getter";
import { Optional } from "./optional";

export type SetFn<M, C> = Setter<M, C> | ReverseGet<M, C>
export type SetOptionalFn<M, C> = SetOptional<M, C> | Setter<M, C> | ReverseGet<M, C>

export function set<M, C> ( optic: SetFn<M, C>, model: M, child: C ): M {
  return setFn ( optic ) ( model, child )
}
export function setOptional<M, C> ( optic: SetOptionalFn<M, C>, model: M, child: C ): M | undefined {
  return setOptionalFn ( optic ) ( model, child )
}
export function setOptionalOrOriginal<M, C> ( optic: SetOptionalFn<M, C>, model: M, child: C ): M {
  const result = setOptionalFn ( optic ) ( model, child )
  return result === undefined ? model : result
}
export const mapOptionalOrOriginal = <M, C> ( optic: Optional<M, C>)=>( model: M, fn: ( child: C ) => C ): M => {
  const result = getOptional ( optic, model )
  if ( result === undefined ) return model
  const newChild = fn ( result )
  return setOptionalOrOriginal ( optic, model, newChild )
};

export interface SetOptional<M, C> {setOptional: ( model: M, child: C ) => M | undefined}
export function isSetOptional<M, C> ( setOptional: SetOptionalFn<M, C> ): setOptional is SetOptional<M, C> {
  return (setOptional as any).setOptional !== undefined
}

export function setOptionalFn<M, C> ( set: SetOptionalFn<M, C> ): ( model: M, child: C ) => M | undefined {
  if ( isSetOptional ( set ) ) return set.setOptional
  if ( isReverseGet ( set ) ) return ( m, c ) => set.reverseGet ( c )
  return set.set
}
export interface Setter<M, C> {set: ( model: M, child: C ) => M}
export function isSetter<M, C> ( set: SetFn<M, C> ): set is Setter<M, C> {
  return (set as any).set !== undefined
}

export function setFn<M, C> ( o: SetFn<M, C> ): (( m: M, c: C ) => M) {
  if ( isSetter ( o ) ) return o.set
  if ( isReverseGet ( o ) ) return ( m, c ) => o.reverseGet ( c )
  throw new Error ( 'setFn: not a setter' )
}

export interface ReverseGet<M, C> {reverseGet: ( child: C ) => M}
export function isReverseGet<M, C> ( reverseGet: SetFn<M, C> ): reverseGet is ReverseGet<M, C> {
  return (reverseGet as any).reverseGet !== undefined
}
