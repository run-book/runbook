import { filterToType } from "./list";
import { mapK } from "./async";

export interface Errors {
  errors: string[]
}
export function isErrors ( errors: any ): errors is Errors {
  return errors && errors.errors && Array.isArray ( errors.errors )
}
export function isValue<T> ( t: ErrorsAnd<T> ): t is T {
  return !isErrors ( t )
}
export type ErrorsAnd<T> = T | Errors

export function foldErrors<T,T1> ( t: ErrorsAnd<T>, f: ( t: T ) => T1, g: ( e: Errors ) => T1 ): T1 {
  return isErrors ( t ) ? g ( t ) : f ( t );
}
export function mapErrors<T, T1> ( t: ErrorsAnd<T>, f: ( t: T ) => T1 ): ErrorsAnd<T1> {
  return isErrors ( t ) ? t : f ( t );
}

export function composeErrors ( rs: Errors[] ): Errors {
  return { errors: rs.reduce ( ( acc, r ) => acc.concat ( r.errors ), [] ) }
}
export function toErrorsAnd<T> ( ts: ErrorsAnd<T>[] ): ErrorsAnd<T[]> {
  const errors = filterToType ( ts, isErrors )
  return errors.length > 0 ? composeErrors ( errors ) : ts as T[]
}
export async function mapErrorsK<T, T1> ( t: ErrorsAnd<T>, f: ( t: T ) => Promise<T1> ): Promise<ErrorsAnd<T1>> {
  return isErrors ( t ) ? t : await f ( t )
}
export function mapArrayErrorsK<T, T1> ( t: T[], f: ( t: T ) => Promise<ErrorsAnd<T1>> ): Promise<ErrorsAnd<T1[]>> {
  return mapK ( t, f ).then ( toErrorsAnd )
}