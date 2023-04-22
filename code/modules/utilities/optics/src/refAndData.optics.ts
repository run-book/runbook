import { Optional, OptionalR } from "./optional";
import { RefAndData } from "@runbook/utils";
import { getOptional } from "./getter";
import { setOptional } from "./setter";

export const optionalForRefAndData = <S, Ref, Data> ( refO: Optional<S, Ref>, dataO: Optional<S, Data> ): Optional<S, RefAndData<Ref, Data>> => {
  return {
    get: ( s: S ) => {
      const refV = getOptional ( refO, s )
      const dataV = getOptional ( dataO, s )
      return { ref: refV, data: dataV }
    },
    set: ( s: S, v: RefAndData<Ref, Data> ) => {
      const one = setOptional ( refO, s, v.ref )
      if ( one === undefined ) return undefined
      return setOptional ( dataO, one, v.data )
    }
  }
}
export function focusDataOn<S, Ref, T, K extends keyof T> ( refDataOpt: Optional<S, RefAndData<Ref, T>>, key: K ): OptionalR<S, RefAndData<Ref, T[K]>> {
  return {
    getOptional: ( s: S ) => {
      const refB = getOptional ( refDataOpt, s )
      if ( refB === undefined ) return undefined
      return { ref: refB.ref, data: refB.data[ key ] }
    },
    setOptional: ( s: S, v: RefAndData<Ref, T[K]> ) => {
      const existingRefAndData = getOptional ( refDataOpt, s )
      const newData: T = existingRefAndData ? { ...existingRefAndData.data } : {} as T
      newData[ key ] = v.data
      return setOptional ( refDataOpt, s, { ref: v.ref, data: newData } )
    }
  }
}

export function focusRefOn<S, Ref, T, K extends keyof Ref> ( refDataOpt: Optional<S, RefAndData<Ref, T>>, key: K ): OptionalR<S, RefAndData<Ref[K], T>> {
  return {
    getOptional: ( s: S ) => {
      const refB = getOptional ( refDataOpt, s )
      if ( refB === undefined ) return undefined
      return { ref: refB.ref[ key ], data: refB.data }
    },
    setOptional: ( s: S, v: RefAndData<Ref[K], T> ) => {
      const existingRefAndData = getOptional ( refDataOpt, s )
      const newRef: Ref = existingRefAndData ? { ...existingRefAndData.ref } : {} as Ref
      newRef[ key ] = v.ref
      return setOptional ( refDataOpt, s, { ref: newRef, data: v.data } )
    }
  }
}

export function focusOnJustRef<S, Ref, T> ( refDataOpt: Optional<S, RefAndData<Ref, T>> ): OptionalR<S, Ref> {
  return {
    getOptional: ( s: S ) => {
      const refB = getOptional ( refDataOpt, s )
      return refB?.ref
    },
    setOptional: ( s: S, v: Ref ) => {
      const existingRefAndData = getOptional ( refDataOpt, s )
      return setOptional ( refDataOpt, s, { ref: v, data: existingRefAndData.data } )
    }
  }

}
export function focusOnJustData<S, Ref, T> ( refDataOpt: Optional<S, RefAndData<Ref, T>> ): OptionalR<S, T> {
  return {
    getOptional: ( s: S ) => {
      const refB = getOptional ( refDataOpt, s )
      return refB?.data
    },
    setOptional: ( s: S, v: T ) => {
      const existingRefAndData = getOptional ( refDataOpt, s )
      return setOptional ( refDataOpt, s, { ref: existingRefAndData.ref, data: v } )
    }
  }

}