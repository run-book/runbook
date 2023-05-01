export interface PartialFunctionK<From, To> {
  isDefinedAt: ( from: From ) => Promise<boolean>
  apply: ( from: From ) => To
}

export const chainOfResponsibilityK = <From, To> ( defaultFn: ( from: From ) => To, ...fns: PartialFunctionK<From, To>[] ): ( from: From ) => Promise<To> =>
  async ( from: From ): Promise<To> => {
    for ( let fn of fns )
      if ( await fn.isDefinedAt ( from ) ) return fn.apply ( from )
    return await defaultFn ( from )
  }

