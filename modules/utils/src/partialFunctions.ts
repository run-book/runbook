import { ErrorsAnd } from "./errors";

export interface PartialFunction<From, To> {
  isDefinedAt: ( from: From ) => boolean
  apply: ( from: From ) => To
}
export interface PartialFunction2<Opt, From, To> {
  isDefinedAt: ( from: Opt ) => boolean
  apply: ( from: From, opt: Opt ) => To
}

export const chainOfResponsibility2 = <From, Opt,To> ( defaultFn: ( from: From, opt: Opt ) => To, ...fns: PartialFunction2<Opt, From, To>[] ) =>
  ( opt: Opt, from: From ): To => {
    for ( let fn of fns )
      if ( fn.isDefinedAt ( opt ) ) return fn.apply ( from, opt )
    return defaultFn ( from, opt )
  }

export const chainOfResponsibility = <From, To> ( defaultFn: ( from: From ) => To, ...fns: PartialFunction<From, To>[] ) =>
  ( from: From ): To => {
    for ( let fn of fns )
      if ( fn.isDefinedAt ( from ) ) return fn.apply ( from )
    return defaultFn ( from )
  }

export const partial = ( isDefinedAt: ( from: any ) => boolean ) => ( apply: ( from: any ) => any ): PartialFunction<any, any> => ({ isDefinedAt, apply });

// export const chainOfResponsibility2 = <Options, From, To> ( defaultFn: ( from: From ) => To,
//                                                             ...fns: (( opt: Options ) => ( from: From ) => To | undefined)[] ) =>
//   ( from1: From1, from2: From2 ): To => {
//     for ( let fn of fns ) {
//       const result = fn ( from1, from2 )
//       if ( result !== undefined ) return result
//     }
//     return defaultFn ( from1, from2 )
//   }