import { Mereology } from "@runbook/mereology";
import { ReferenceData } from "@runbook/referencedata";
import { BindingContext, evaluate } from "@runbook/bindings";

import { mapObjValues, safeObject } from "@runbook/utils";
import { DisplayBindingProps, displayBindings } from "@runbook/bindings_react";

export function makeConditionToDisplayParentChildRefData ( m: Mereology, parent: string, child: string ) {
  return {
    [ `{${parent}:${parent}}` ]: {
      [ `{${child}:${child}}` ]: {
        ...mapObjValues ( safeObject ( m[ parent ]?.children?.[ child ]?.fields ), ( item, name ) => `{${name}?:}` )
      }
    },
  };
}
//For example parent might be environment and child might be service
export function makeBindingsForParentChildRefData ( bc: BindingContext, parent: string, child: string, m: Mereology, r: ReferenceData ) {
  const cond = makeConditionToDisplayParentChildRefData ( m, parent, child );
  return evaluate ( bc, cond ) ( r )
}

export const displayParentChildReferenceDataTable = ( m: Mereology, r: ReferenceData, bc: BindingContext, props: DisplayBindingProps ) => ( order: string[] ) => ( parent: string, child: string ): JSX.Element =>
  displayBindings ( props ) ( order ) ( makeBindingsForParentChildRefData ( bc, parent, child, m, r ) )

export function makeConditionToDisplayOneRefData ( m: Mereology, item: string ) {
  return {
    [ `{${item}:${item}}` ]: {
      ...mapObjValues ( safeObject ( m[ item ]?.fields ), ( item, name ) => `{${name}?:}` )
    }
  }
}
export function makeBindingsForOneRefData ( bc: BindingContext, item: string, m: Mereology, r: ReferenceData ) {
  const cond = makeConditionToDisplayOneRefData ( m, item );
  return evaluate ( bc, cond ) ( r )
}

export const displayOneReferenceDataTable = ( m: Mereology, r: ReferenceData, bc: BindingContext, props: DisplayBindingProps ) => ( order: string[] ) => ( item: string ): JSX.Element =>
  displayBindings ( props ) ( order ) ( makeBindingsForOneRefData ( bc, item, m, r ) )