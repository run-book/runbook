export interface HasDescription {
  description?: Description
}

type Description = string | (() => string)
export function isHasDescription ( obj: any ): obj is HasDescription {
  return obj && obj.description
}
export function getDescription ( obj: any, fn?: ( o: any ) => string ): string {
  if ( isHasDescription ( obj ) ) {
    let description = obj.description;
    if (typeof description === 'function' ) description = description ()
    if ( description ) return description
    return description || fn ? fn ( obj ) : 'unknown'
  }
  return fn ( obj )
}

//Why are the descriptions fns? Because they are expensive and we can later turn them off (have it as a debug setting)
export function addDescription<T> ( obj: T, description: () => string ): T & HasDescription {
  (obj as any).description = description()
  return obj as any
}
export function appendDescription<T> ( obj: T, orig: any, description: () => string ): T & HasDescription {
  (obj as any).description =  getDescription ( orig ) + '.' + description ()
  return obj
}