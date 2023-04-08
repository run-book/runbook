import { LensR } from "./lens";

import { setOptionalFn } from "./setter";
import { getOptionalFn } from "./getter";
import { Iso } from "./iso";
import { PrismR } from "./prism";

export type Optional<M, C> = OptionalR<M, C> | Iso<M, C> | LensR<M, C> | PrismR<M, C>
export interface OptionalR<M, C> {
  getOptional: ( model: M ) => C | undefined
  setOptional: ( model: M, child: C ) => M | undefined
}
export function isOptionalR<M, C> ( optional: OptionalR<M, C> ): optional is OptionalR<M, C> {
  return optional.getOptional !== undefined && optional.setOptional !== undefined
}

export function composeOptional<M, C, GC> ( first: Optional<M, C>, second: Optional<C, GC> ): OptionalR<M, GC> {
  const getFirst: ( model: M ) => (C | undefined) = getOptionalFn ( first )
  const getSecond: ( model: C ) => (GC | undefined) = getOptionalFn ( second )
  const setFirst: ( model: M, child: C ) => (M | undefined) = setOptionalFn ( first )
  const setSecond: ( model: C, child: GC ) => (C | undefined) = setOptionalFn ( second )
  return {
    getOptional: ( model: M ): (GC | undefined) => getSecond ( getFirst ( model ) ),
    setOptional: ( model: M, child: GC ) => setFirst ( model, setSecond ( getFirst ( model ), child ) )
  }
}

export function nthItem<M> ( index: number ): OptionalR<M[], M> {
  return {
    getOptional: ( model: M[] ) => model[ index ],
    setOptional: ( model: M[], child: M ) => {
      if ( model.length > index ) {
        const copy = [ ...model ]
        copy[ index ] = child
        return copy
      }
      return undefined
    }
  }
}

export function appendItem<M> (): OptionalR<M[], M> {
  return {
    getOptional: ( model: M[] ) => undefined,
    setOptional: ( model: M[], child: M ) => {
      const copy = [ ...model ]
      copy.push ( child )
      return copy
    }
  }
}