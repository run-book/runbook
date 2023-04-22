import { RunbookComponent } from "@runbook/runbook_state";
import { makeProps } from "./display";

export function textarea<S extends any> ( extra?: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> ): RunbookComponent<S, string> {
  return st => props =>
    <textarea  {...(makeProps ( extra, props ))} value={st.get ()} onChange={e => st.set ( e.target.value )}>{st.optGet ()}</textarea>
}


export function textareaForObj<S extends any> ( extra?: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> ): RunbookComponent<S, any> {
  return st => props => {
    let value: string = JSON.stringify ( st.optGet (), null, 2 );
    return <textarea {...(makeProps ( extra, props ))} value={value} onChange={e => st.set ( JSON.parse ( e.target.value ) )}/>;
  }
}