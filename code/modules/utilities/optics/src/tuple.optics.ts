import { Optional, OptionalR } from "./optional";
import { addDescription, appendDescription, getDescription, Tuple2 } from "@runbook/utils";
import { getOptional } from "./getter";
import { setOptional } from "./setter";

export const optionalForTuple = <S, A, B> ( t1Opt: Optional<S, A>, bOpt: Optional<S, B> ): Optional<S, Tuple2<A, B>> => {
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
export function focusBOn<S, A, B, K extends keyof B> ( tupleOpt: Optional<S, Tuple2<A, B>>, key: K ): OptionalR<S, Tuple2<A, B[K]>> {
  return appendDescription<OptionalR<S, Tuple2<A, B[K]>>> ( {
    getOptional: ( s: S ) => {
      const tupleB = getOptional ( tupleOpt, s )
      if ( tupleB === undefined ) return undefined
      return { a: tupleB.a, b: tupleB.b[ key ] }
    },
    setOptional: ( s: S, tuple: Tuple2<A, B[K]> ) => {
      const existingTuple = getOptional ( tupleOpt, s )
      const newB: B = existingTuple ? { ...existingTuple.b } : {} as B
      newB[ key ] = tuple.b
      return setOptional ( tupleOpt, s, { a: tuple.a, b: newB } )
    }
  }, tupleOpt, () => `focusBOn(${key.toString ()})` )
}

export function focusAon<S, A, B, K extends keyof A> ( tupleOpt: Optional<S, Tuple2<A, B>>, key: K ): OptionalR<S, Tuple2<A[K], B>> {
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

export function focusOnJustA<S, A, B> ( tupleOpt: Optional<S, Tuple2<A, B>> ): OptionalR<S, A> {
  return appendDescription ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( tupleOpt, s )
      return t?.a
    },
    setOptional: ( s: S, v: A ) => {
      const t = getOptional ( tupleOpt, s )
      return setOptional ( tupleOpt, s, { a: v, b: t.b } )
    }
  }, tupleOpt, () => `focusOnJustA()` )

}
export function focusOnJustB<S, A, B> ( refDataOpt: Optional<S, Tuple2<A, B>> ): OptionalR<S, B> {
  return appendDescription ( {
    getOptional: ( s: S ) => {
      const t = getOptional ( refDataOpt, s )
      return t?.b
    },
    setOptional: ( s: S, v: B ) => {
      const t = getOptional ( refDataOpt, s )
      return setOptional ( refDataOpt, s, { a: t.a, b: v } )
    }
  }, refDataOpt, () => `focusOnJustB()` )

}