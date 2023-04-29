import { Mereology } from "@runbook/mereology";
import { ReferenceData } from "@runbook/referencedata";
import { BindingContext, evaluate } from "@runbook/bindings";

//For example parent might be environment and child might be service
export function makeBindingsForRefData ( bc: BindingContext, parent: string, child: string, r: ReferenceData ) {
  const cond = { [ `{${parent}}:parent` ]: { [ `{${child}}:${child}` ]: {} } }
  return evaluate ( bc, cond ) ( r )
}

export function displayReferenceData ( m: Mereology, r: ReferenceData ): JSX.Element {
  return <div></div>

}