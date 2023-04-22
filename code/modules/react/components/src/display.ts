import { labelAnd } from "./labelAnd";
import { decamelize } from "@runbook/utils";
import { display, displayChild, RunbookComponent, RunbookProps, RunbookState } from "@runbook/runbook_state";


export function makeProps<Props, C> ( extra: Props | undefined, props: RunbookProps<C> ) {
  return { ...extra || {}, ...props, mode: undefined, focusedOn: undefined };
}
export const displayLabeledChildWithLabel = <S, C, K extends keyof C> ( st: RunbookState<S, C>, props: RunbookProps<C>, r: RunbookComponent<S, C[K]>, label: ( def: string ) => string, k: K ): JSX.Element =>
  displayChild ( st, props, k, labelAnd ( label ( decamelize ( k.toString () ) ), r ) );
export const displayLabeledChild = <S, C, K extends keyof C> ( st: RunbookState<S, C>, props: RunbookProps<C>, r: RunbookComponent<S, C[K]>, k: K ): JSX.Element =>
  displayLabeledChildWithLabel ( st, props, r, l => l, k );
