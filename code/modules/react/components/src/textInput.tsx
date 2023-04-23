import { RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { makeProps } from "./display";
import { commonIntegerInputComponentConfig, commonStringInputComponentConfig, defaultInputComponentConfig, InputComponentConfig, propsFrom } from "./component.config";


export type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
export const commonInput = <S extends any, C> ( config: InputComponentConfig<C, InputProps>,
                                                type: string ) => (
  extra: InputProps | undefined ): RunbookComponent<S, C> => st => props =>
  <input  {...(propsFrom ( st, props, config, extra ))} type={type}/>;

export const textInput: <S extends any>( extra?: InputProps ) => RunbookComponent<S, string> =
               commonInput ( commonStringInputComponentConfig, 'text' );

export const integerInput: <S extends any>( extra?: InputProps ) => RunbookComponent<S, number> =
               commonInput ( commonIntegerInputComponentConfig, 'number' );

export const optionsInput: <S extends any>( extra?: InputProps ) => RunbookComponent<S, string> = commonInput ( {
  ...commonStringInputComponentConfig,
  setProps: <S, C> ( st: RunbookState<S, C> ) => ({ onChange: ( e: any ) => {throw new Error ( 'not yet' )} })
}, 'number' );


