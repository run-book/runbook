import { ErrorsAnd, isErrors } from "@runbook/utils";
import { RunbookProps, RunbookState } from "@runbook/runbook_state";

export interface InputComponentConfig<C, Props> {
  printer: ( t: C | undefined ) => string
  /** ErrorsAnd will come up as validation errors */
  parser: ( s: string ) => ErrorsAnd<C>
  /** different component types express'value=' in different ways */
  valueProps: ( t: C | undefined, printer: ( t: C | undefined ) => string ) => Props
  modeProps: ( mode: string | undefined ) => Props
  extraProps?: Props
  setProps: <S>( st: RunbookState<S, NonNullable<C>>, parser: ( s: string ) => ErrorsAnd<C> ) => Props

}

export const defaultInputComponentConfig = {
  extraProps: {},
  modeProps: ( mode: string | undefined ) => mode === 'view' ? { disabled: true } : {},
  valueProps: ( t: any, printer: ( t: any ) => string ) => ({ value: printer ( t ) }),
  setProps: <S, C> ( st: RunbookState<S, C>, parser: ( s: string ) => ErrorsAnd<C> ) => ({
    onChange: ( e: any ) => {
      const parsed = parser ( e.target.value )
      if ( isErrors ( parsed ) ) console.error ( "Errors: " + parsed.errors.join ( ", " ) );
      else st.set ( parsed );
    }
  })
}

export const commonStringInputComponentConfig = {
  ...defaultInputComponentConfig,
  parser: ( s: string ) => s,
  printer: ( t: string | undefined ) => t || ''
}

export const commonStringForObjectInputComponentConfig = {
  ...defaultInputComponentConfig,
  printer: ( s: any | undefined ) => JSON.stringify ( s, null, 2 ),
  parser: ( s: string ) => JSON.parse ( s )
}

export const commonIntegerInputComponentConfig = {
  ...defaultInputComponentConfig,
  parser: ( s: string ) => Number.parseInt ( s ),
  printer: ( s: number | undefined ) => s?.toString () || ''
}

export function propsFrom<S, C, Props> ( st: RunbookState<S, NonNullable<C>>, props: RunbookProps<C>, config: InputComponentConfig<C, Props>, extraProps?: Props ) {
  return {
    id: props.id, ...config.valueProps ( props.focusedOn, config.printer ),
    ...config.modeProps ( props.mode ),
    ...config.extraProps,
    ...extraProps,
    ...config.setProps ( st, config.parser )
  };
}

export function setResult<S, C> ( st: RunbookState<S, C>, config: InputComponentConfig<C, any>, s: string ) {
  let c = config.parser ( s );
  if ( isErrors ( c ) ) console.log ( "Errors: " + c.errors.join ( ", " ) );
  else st.set ( c );
}