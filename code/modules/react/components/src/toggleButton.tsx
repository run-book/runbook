import { RunbookComponent } from "@runbook/runbook_state";

export const toggleButton = <S extends any> (hideText?: string, showText?:string): RunbookComponent<S, boolean> => {
  const realHideText = hideText || 'Hide'
  const realShowText = showText || 'Show'
  return st => props => {
      var current = st.optGet ()
      return <button onClick={() => st.set ( !current )}>{current ? realHideText :realShowText}</button>
    };
};