import { ErrorsAnd } from "./errors";

export const chainOfResponsibility = <From, To> ( defaultFn: ( from: From ) => To, ...fns: (( from: From ) => To | undefined)[] ) =>
  ( from: From ): To => {
    for ( let fn of fns ) {
      const result = fn ( from )
      if ( result !== undefined ) return result
    }
    return defaultFn ( from )
  }


export type PF2<F1, F2, T> = ( from1: F1, from2: F2 ) => T | undefined

export const guard2 = <F1, F2, > ( guard: PF2<F1, F2, boolean> ) => <T> ( fn: PF2<F1, F2, T> ): PF2<F1, F2, T> =>
  ( from1, from2 ) => guard ( from1, from2 ) && fn ( from1, from2 )

// export const chainOfResponsibility2 = <Options, From, To> ( defaultFn: ( from: From ) => To,
//                                                             ...fns: (( opt: Options ) => ( from: From ) => To | undefined)[] ) =>
//   ( from1: From1, from2: From2 ): To => {
//     for ( let fn of fns ) {
//       const result = fn ( from1, from2 )
//       if ( result !== undefined ) return result
//     }
//     return defaultFn ( from1, from2 )
//   }