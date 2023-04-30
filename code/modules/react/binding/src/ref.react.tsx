import { Mereology } from "@runbook/mereology";
import { ReferenceData } from "@runbook/referencedata";
import { BindingContext, evaluate } from "@runbook/bindings";
import { DisplayBindingProps, displayBindings } from "@runbook/referencedata_react";

//For example parent might be environment and child might be service
export function makeBindingsForRefData ( bc: BindingContext, parent: string, child: string, m: Mereology, r: ReferenceData ) {

  const cond = {
    [ `{${parent}:${parent}}` ]: {
      [ `{${child}:${child}}` ]: {}
    },
  }
  // return cond
  return evaluate ( bc, cond ) ( r )
}

export const displayOneReferenceDataTable = ( m: Mereology, r: ReferenceData, bc: BindingContext, props: DisplayBindingProps ) => ( order: string[] ) => ( parent: string, child: string ): JSX.Element =>
  displayBindings ( props ) ( order ) ( makeBindingsForRefData ( bc, parent, child, m, r ) )