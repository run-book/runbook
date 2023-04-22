import { RunbookProps } from "@runbook/runbook_state";

export interface AttributeValueListProps<C> extends RunbookProps<C> {
  children: React.ReactNode
}

export function AttributeValueList<C> ( props: AttributeValueListProps<C> ): JSX.Element {
  return <dl>{props.children}</dl>

}
