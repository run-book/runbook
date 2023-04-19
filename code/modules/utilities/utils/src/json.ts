import { ErrorsAnd } from "./errors";

export type JsonParser = <T>( json: string ) => ErrorsAnd<T>

export const parseJson: JsonParser = <T> ( json: string ): ErrorsAnd<T> => {
  try {
    return JSON.parse ( json ) as T
  } catch ( e: any ) {
    return { errors: [ e.toString () ] }
  }
}