import { Lens } from "./lens";
import { setFn, setOptionalFn } from "./setter";
import { Optional } from "./optional";
import { getOptionalFn } from "./getter";


export function focusOn<M, C, K extends keyof C> ( lens: Lens<M, C>, key: K ): Lens<M, C[K]> {
  const set = setFn ( lens )
  return {
    get: ( model: M ) => lens.get ( model )[ key ],
    set: ( model: M, child: C[K] ) => {
      const c = { ...lens.get ( model ) }
      c[ key ] = child
      return set ( model, c )
    }
  }
}

export function focusQuery<M, C, K extends keyof C> ( o: Optional<M, C>, key: K ): Optional<M, C[K]> {
  const getOptional = getOptionalFn ( o );
  const setOptional = setOptionalFn ( o );
  return {
    getOptional: ( model: M ) => {
      const c = getOptional ( model );
      if ( c === undefined ) return undefined;
      return c[ key ];
    },
    setOptional: ( model: M, child: C[K] ) => {
      const c = getOptional ( model );
      const copy: any = c === undefined ? {} : { ...c }
      copy[ key ] = child;
      return setOptional ( model, copy );
    }
  }
}