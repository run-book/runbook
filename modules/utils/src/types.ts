import { ErrorsAnd } from "./errors";

export type Kleisli<A,B> = ( a: A ) => Promise<B>
export type KleisliWithErrors<A,B> = ( a: A ) => Promise<ErrorsAnd<B>>
