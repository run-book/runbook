import { RunbookState } from "./runbookState";

export const jsonMe = ( st: RunbookState<any, any> ) : JSX.Element => {
  return <pre>{JSON.stringify ( st.optGet (), null, 2 )}</pre>
}
