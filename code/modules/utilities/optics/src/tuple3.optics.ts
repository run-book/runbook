import { Optional, OptionalR } from "./optional";
import { addDescription, appendDescription, getDescription, Tuple3 } from "@runbook/utils";
import { getOptional } from "./getter";
import { setOptional } from "./setter";
import { focusOnJust } from "./object.options";

export const optionalForTuple3 = <S, A, B, C> ( aOpt: Optional<S, A>, bOpt: Optional<S, B>, cOpt: Optional<S, C> ): Optional<S, Tuple3<A, B, C>> => {
  return addDescription ( {
    get: ( s: S ) => {
      const a = getOptional ( aOpt, s )
      const b = getOptional ( bOpt, s )
      const c = getOptional ( cOpt, s )
      return { a, b, c }
    },
    set: ( s: S, v: Tuple3<A, B, C> ) => {
      const one = setOptional ( aOpt, s, v.a )
      if ( one === undefined ) return undefined
      let two = setOptional ( bOpt, one, v.b );
      if ( two === undefined ) return undefined
      return setOptional ( cOpt, two, v.c )
    }
  }, () => `tuple3(${getDescription ( aOpt )},${getDescription ( bOpt )},${getDescription ( cOpt )})` )
}
export function focusAon3<S, A, B, C, K extends keyof A> ( tupleOpt: Optional<S, Tuple3<A, B, C>>, key: K ): OptionalR<S, Tuple3<A[K], B, C>> {
  return appendDescription<OptionalR<S, Tuple3<A[K], B, C>>> ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( tupleOpt, s )
      if ( t === undefined ) return undefined
      return { a: t.a[ key ], b: t.b, c: t.c }
    },
    setOptional: ( s: S, tuple: Tuple3<A[K], B, C> ) => {
      const existingTuple = getOptional ( tupleOpt, s )
      const newA: A = existingTuple ? { ...existingTuple.a } : {} as A
      newA[ key ] = tuple.a
      return setOptional ( tupleOpt, s, { a: newA, b: tuple.b, c: tuple.c } )
    }
  }, tupleOpt, () => `focusAon3(${key.toString ()})` )
}


export function focusBOn3<S, A, B, C, K extends keyof B> ( tupleOpt: Optional<S, Tuple3<A, B, C>>, key: K ): OptionalR<S, Tuple3<A, B[K], C>> {
  return appendDescription<OptionalR<S, Tuple3<A, B[K], C>>> ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( tupleOpt, s )
      if ( t === undefined ) return undefined
      return { a: t.a, b: t.b[ key ], c: t.c }
    },
    setOptional: ( s: S, tuple: Tuple3<A, B[K], C> ) => {
      const existingTuple = getOptional ( tupleOpt, s )
      const newB: B = existingTuple ? { ...existingTuple.b } : {} as B
      newB[ key ] = tuple.b
      return setOptional ( tupleOpt, s, { a: tuple.a, b: newB, c: tuple.c } )
    }
  }, tupleOpt, () => `focusBOn3(${key.toString ()})` )
}
export function focusCOn3<S, A, B, C, K extends keyof C> ( tupleOpt: Optional<S, Tuple3<A, B, C>>, key: K ): OptionalR<S, Tuple3<A, B, C[K]>> {
  return appendDescription<OptionalR<S, Tuple3<A, B, C[K]>>> ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( tupleOpt, s )
      if ( t === undefined ) return undefined
      return { a: t.a, b: t.b, c: t.c[ key ] }
    },
    setOptional: ( s: S, tuple: Tuple3<A, B, C[K]> ) => {
      const existingTuple = getOptional ( tupleOpt, s )
      const newC: C = existingTuple ? { ...existingTuple.c } : {} as C
      newC[ key ] = tuple.c
      return setOptional ( tupleOpt, s, { a: tuple.a, b: tuple.b, c: newC } )
    }
  }, tupleOpt, () => `focusCOn3(${key.toString ()})` )
}


export const focusOnJustA3 = <S, A, B, C> ( tupleOpt: Optional<S, Tuple3<A, B, C>> ): Optional<S, A> =>
  focusOnJust<S, Tuple3<A, B, C>, 'a'> ( tupleOpt, 'a' );
export const focusOnJustB3 = <S, A, B, C> ( tupleOpt: Optional<S, Tuple3<A, B, C>> ): Optional<S, B> =>
  focusOnJust<S, Tuple3<A, B, C>, 'b'> ( tupleOpt, 'b' )
export const focusOnJustC3 = <S, A, B, C> ( tupleOpt: Optional<S, Tuple3<A, B, C>> ): Optional<S, C> =>
  focusOnJust<S, Tuple3<A, B, C>, 'c'> ( tupleOpt, 'c' )