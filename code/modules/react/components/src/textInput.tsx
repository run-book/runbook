import { RunbookComponent } from "@runbook/runbook_state";
import { makeProps } from "./display";


export function textInput<S extends any> ( extra?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> ): RunbookComponent<S, string > {
  return st => props =>
    <input  {...(makeProps ( extra, props ))} type='text' value={st.optGet () || ''} onChange={e => st.set ( e.target.value )}></input>
}
export function integerInput<S extends any> ( extra?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> ): RunbookComponent<S, number | undefined> {
  return st => props =>
    <input  {...(makeProps ( extra, props ))} type='number' value={st.optGet () || 0} onChange={e => st.set ( Number.parseInt ( e.target.value ) )}></input>
}

export function optionsInput<S extends any, T> ( extra?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> ): RunbookComponent<S, T | undefined> {
  return st => props =>
    <input  {...(makeProps ( extra, props ))} type='text' value={st.optGet ()?.toString () || ''} onChange={e => {throw new Error ( 'not yet' )}}></input>
}