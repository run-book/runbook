import { RunbookState } from "./runbookState";

export const jsonMe = ( st: RunbookState<any, any> )  => {
  return <pre>{JSON.stringify ( st.optGet (), null, 2 )}</pre>
}
