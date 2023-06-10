import { jsonMe, RunbookComponent } from "@runbook/runbook_state";
import { identity } from "@runbook/optics";


export interface RunbookDebug {
  showDebug?: boolean
  showRef?: boolean

}

export const showDebug = <S extends any> (): RunbookComponent<S, boolean> => st => props => {
  const show = st.optGet ();
  const fullSt = st.withOpt(identity())
  return show ? <>
    <hr/>
    {jsonMe ( fullSt )}</> : <></>;
};
