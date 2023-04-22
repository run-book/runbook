import { Lens } from "./lens";
import { setFn, setOptionalFn } from "./setter";
import { Optional } from "./optional";
import { getOptionalFn } from "./getter";
import { addDescription, appendDescription, getDescription } from "@runbook/utils";


export function focusOn<M, C, K extends keyof C> ( lens: Lens<M, C>, key: K ): Lens<M, C[K]> {
  const set = setFn ( lens )
  return appendDescription ( {
    get: ( model: M ) => lens.get ( model )[ key ],
    set: ( model: M, child: C[K] ) => {
      const c = { ...lens.get ( model ) }
      c[ key ] = child
      return set ( model, c )
    }
  }, lens, () => key.toString () )
}

export function focusQuery<M, C, K extends keyof C> ( o: Optional<M, C>, key: K ): Optional<M, C[K]> {
  const getOptional = getOptionalFn ( o );
  const setOptional = setOptionalFn ( o );
  return appendDescription ( {
    getOptional: ( model: M ) => {
      const c = getOptional ( model );
      if ( c === undefined ) return undefined;
      return c?.[ key ] as C[K];// I think we moved beyond typescripts type system here.
    },
    setOptional: ( model: M, child: C[K] ) => {
      const c = getOptional ( model );
      const copy: any = c === undefined ? {} : { ...c }
      copy[ key ] = child;
      return setOptional ( model, copy );
    }
  }, o, () => key.toString () )
}