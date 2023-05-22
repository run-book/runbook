import { appendDescription } from "@runbook/utils";
import { getOptional } from "./getter";
import { setOptional } from "./setter";
import { Optional } from "./optional";

export const focusOnJust = <M, C, K extends keyof C> ( opt: Optional<M, C>, key: K ): Optional<M, C[K]> => appendDescription ( {
  getOptional: ( m: M ) => {
    const c = getOptional ( opt, m )
    return c?.[ key ]
  },
  setOptional: ( m: M, v: C[K] ) => {
    const c = getOptional ( opt, m )
    return setOptional ( opt, m, { ...c, [ key ]: v } )
  }
}, opt, () => `focusOnJust(${key.toString ()})` );
