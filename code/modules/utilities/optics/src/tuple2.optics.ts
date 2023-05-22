import { Optional, OptionalR } from "./optional";
import { addDescription, appendDescription, getDescription, Tuple2 } from "@runbook/utils";
import { getOptional } from "./getter";
import { setOptional } from "./setter";
import { focusOnJust } from "./object.options";

export const optionalForTuple2 = <S, A, B> ( t1Opt: Optional<S, A>, bOpt: Optional<S, B> ): Optional<S, Tuple2<A, B>> => {
  return addDescription ( {
    get: ( s: S ) => {
      const a = getOptional ( t1Opt, s )
      const b = getOptional ( bOpt, s )
      return { a: a, b: b }
    },
    set: ( s: S, v: Tuple2<A, B> ) => {
      const one = setOptional ( t1Opt, s, v.a )
      if ( one === undefined ) return undefined
      return setOptional ( bOpt, one, v.b )
    }
  }, () => `tuple2(${getDescription ( t1Opt )},${getDescription ( bOpt )})` )
}
export function focusBOn2<S, A, B, K extends keyof B> ( tupleOpt: Optional<S, Tuple2<A, B>>, key: K ): OptionalR<S, Tuple2<A, B[K]>> {
  return appendDescription<OptionalR<S, Tuple2<A, B[K]>>> ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( tupleOpt, s )
      if ( t === undefined ) return undefined
      return { a: t.a, b: t.b[ key ] }
    },
    setOptional: ( s: S, tuple: Tuple2<A, B[K]> ) => {
      const existingTuple = getOptional ( tupleOpt, s )
      const newB: B = existingTuple ? { ...existingTuple.b } : {} as B
      newB[ key ] = tuple.b
      return setOptional ( tupleOpt, s, { a: tuple.a, b: newB } )
    }
  }, tupleOpt, () => `focusBOn(${key.toString ()})` )
}

export function focusAon2<S, A, B, K extends keyof A> ( tupleOpt: Optional<S, Tuple2<A, B>>, key: K ): OptionalR<S, Tuple2<A[K], B>> {
  return appendDescription ( {
    getOptional: ( s: S ) => {
      const refB = getOptional ( tupleOpt, s )
      if ( refB === undefined ) return undefined
      return { a: refB.a[ key ], b: refB.b }
    },
    setOptional: ( s: S, t: Tuple2<A[K], B> ) => {
      const existingRefAndData = getOptional ( tupleOpt, s )
      const newA: A = existingRefAndData ? { ...existingRefAndData.a } : {} as A
      newA[ key ] = t.a
      return setOptional ( tupleOpt, s, { a: newA, b: t.b } )
    }
  }, tupleOpt, () => `focusAon(${key.toString ()})` )
}

export const focusOnJustA2 = <S, A, B> ( tupleOpt: Optional<S, Tuple2<A, B>> ): Optional<S, A> =>
  focusOnJust<S, Tuple2<A, B>, 'a'> ( tupleOpt, 'a' );
export const focusOnJustB2 = <S, A, B> ( tupleOpt: Optional<S, Tuple2<A, B>> ): Optional<S, B> =>
  focusOnJust<S, Tuple2<A, B>, 'b'> ( tupleOpt, 'b' )