import { ErrorsAnd } from "./errors";

export type JsonParser = <T>( json: string ) => ErrorsAnd<T>

export const parseJson: JsonParser = json => {
  try {
    return JSON.parse ( json )
  } catch ( e ) {
    return { errors: [ e.message ] }
  }
}