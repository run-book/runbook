export type OpticGetFn<M, C> = GetOptional<M, C> | Getter<M, C>
export function get<M, C> ( optic: OpticGetFn<M, C>, model: M ): C {
  if ( isGet ( optic ) ) return optic.get ( model )
  return optic.getOptional ( model )
}
export function getOptional<M, C> ( optic: OpticGetFn<M, C>, model: M ): C | undefined {
  return isGetOptional ( optic ) ? optic.getOptional ( model ) : optic.get ( model );
}

export interface GetOptional<M, C> {getOptional: ( model: M ) => C | undefined}
export function isGetOptional<M, C> ( getOptional: OpticGetFn<M, C> ): getOptional is GetOptional<M, C> {
  return (getOptional as any).getOptional !== undefined
}
export function getOptionalFn<M, C> ( getOptional: OpticGetFn<M, C> ): ( model: M ) => C | undefined {
  return isGetOptional ( getOptional ) ? getOptional.getOptional : getOptional.get
}
export interface Getter<M, C> {get: ( model: M ) => C}
export function isGet<M, C> ( get: OpticGetFn<M, C> ): get is Getter<M, C> {
  return (get as any).get !== undefined
}