import { Optional } from "./optional";
import { setOptional } from "./setter";
import { Iso } from "./iso";

export type OpticGetFn<M, C> = GetOptional<M, C> | Getter<M, C>

export function get<M, C> ( optic: Getter<M, C>, model: M ): C {
  if ( isGet ( optic ) ) return optic.get ( model )
  throw new Error ( `Expected a Getter, but got ${optic}` )
}
export function getOptional<M, C> ( optic: OpticGetFn<M, C>, model: M ): C | undefined {
  return isGetOptional ( optic ) ? optic.getOptional ( model ) : optic.get ( model );
}

export interface GetOptional<M, C> {getOptional: ( model: M ) => C | undefined}
export function isGetOptional<M, C> ( getOptional: OpticGetFn<M, C> ): getOptional is GetOptional<M, C> {
  return (getOptional as any).getOptional !== undefined
}
export function getOptionalFn<M, C> ( getOptional: OpticGetFn<M, C> ): ( model: M ) => C | undefined {
  return isGetOptional ( getOptional ) ? getOptional.getOptional : getOptional.get
}
export interface Getter<M, C> {get: ( model: M ) => C}
export function isGet<M, C> ( get: OpticGetFn<M, C> ): get is Getter<M, C> {
  return (get as any).get !== undefined
}

export function multiplyOpt<M, C1, C2> ( opt1: Optional<M, C1>, opt2: Optional<M, C2> ): Optional<M, [ C1 | undefined, C2 | undefined ]> {
  return {
    getOptional: ( model: M ): ([ C1, C2 ] | undefined) => {
      const one = getOptional ( opt1, model )
      const two = getOptional ( opt2, model )
      if ( one === undefined && two === undefined ) return undefined
      return [ one, two ]
    },
    setOptional: ( model: M, [ c1, c2 ]: [ C1 | undefined, C2 | undefined ] ): (M | undefined) => {
      const one = setOptional ( opt1, model, c1 )
      if ( one === undefined ) return undefined
      const two = setOptional ( opt2, one, c2 )
      return two
    }
  }
}
export function multiplyOptInto<M, C1, C2, Res> ( opt1: Optional<M, C1>, opt2: Optional<M, C2>, iso: Iso<[ C1 | undefined, C2 | undefined ], Res> ): Optional<M, Res> {
  const opt = multiplyOpt ( opt1, opt2 )
  return {
    getOptional: ( model: M ): (Res | undefined) => {
      const array = getOptional ( opt, model ) || [ undefined, undefined ]
      let result = iso.get ( array );
      return result
    },
    setOptional: ( model: M, child: Res ): (M | undefined) => {
      const [ c1, c2 ] = iso.reverseGet ( child )
      return setOptional ( opt, model, [ c1, c2 ] )
    }
  }
}
