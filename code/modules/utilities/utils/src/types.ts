import { ErrorsAnd } from "./errors";

export type Primitive = string | number | boolean | null | undefined;
export function isPrimitive ( a: any ): a is Primitive {
  const t = typeof a
  return a === null || a == undefined || t === 'string' || t === 'number' || t === 'boolean'
}

export type Kleisli<A, B> = ( a: A ) => Promise<B>
export type KleisliWithErrors<A, B> = ( a: A ) => Promise<ErrorsAnd<B>>

export type NameSpaceAndValue = { namespace?: string, value: Primitive } //the value is the name...

