export interface HasDescription {
  description?: string
}
export function isHasDescription ( obj: any ): obj is HasDescription {
  return obj && obj.description
}
export function getDescription ( obj: any, fn: ( o: any ) => string ): string {
  if ( isHasDescription ( obj ) ) return obj.description
  return fn ( obj )
}
export function addDescription<T> ( obj: T, description: string ): T & HasDescription {
  (obj as any).description = description
  return obj as any
}