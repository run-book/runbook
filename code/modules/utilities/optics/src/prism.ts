import { Iso } from "./iso";
import { getOptionalFn } from "./getter";

export type Prism<M, C> = PrismR<M, C> | Iso<M, C>


export interface PrismR<M, C> {
  getOptional: ( model: M ) => C | undefined
  reverseGet: ( child: C ) => M
}
export function isPrismR<M, C> ( prism: PrismR<M, C> ): prism is PrismR<M, C> {
  return prism.getOptional !== undefined && prism.reverseGet !== undefined
}

export function composePrism<M, C, GC> ( first: Prism<M, C>, second: Prism<C, GC> ): PrismR<M, GC> {
  const getFirst = getOptionalFn ( first )
  const getSecond = getOptionalFn ( second )
  return {
    getOptional: ( model: M ) => {
      let first = getFirst ( model );
      if ( first === undefined ) return undefined;
      return getSecond ( first );
    },
    reverseGet: ( child: GC ) => first.reverseGet ( second.reverseGet ( child ) )
  }
}