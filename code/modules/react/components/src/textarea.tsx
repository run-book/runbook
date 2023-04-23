import { RunbookComponent } from "@runbook/runbook_state";
import { makeProps } from "./display";
import { commonStringForObjectInputComponentConfig, commonStringInputComponentConfig, InputComponentConfig, propsFrom } from "./component.config";


export type TextAreaProps = React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
export const commonTextArea = <S extends any, C> ( config: InputComponentConfig<C, TextAreaProps> ) => ( extra: TextAreaProps | undefined ): RunbookComponent<S, C> =>
  st => props =>
    <textarea  {...(propsFrom ( st, props, config, extra ))} />;

export const textArea: <S>( extra?: TextAreaProps ) => RunbookComponent<S, string> = commonTextArea ( commonStringInputComponentConfig )
export const textAreaForObj: <S>( extra?: TextAreaProps ) => RunbookComponent<S, any> = commonTextArea ( commonStringForObjectInputComponentConfig )
