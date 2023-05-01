import { Mereology } from "@runbook/mereology";
import { ReferenceData } from "@runbook/referencedata";
import { Binding, BindingContext, evaluate } from "@runbook/bindings";

import { mapObjToArray, mapObjValues, NameAnd, safeObject } from "@runbook/utils";
import { DisplayBindingProps, displayBindings } from "@runbook/bindings_react";
import { displayBindingProps } from "./ref.react.fixture";


export interface DisplayMereologyContext {
  bc: BindingContext,
  displayBindingProps: DisplayBindingProps,
  m: Mereology,
  r: ReferenceData
}
export interface ParentChild {
  parent: string
  child: string
}

export function childFn ( obj: NameAnd<any>, child: string ) {
  return {
    [ `{${child}:${child}}` ]: {
      ...mapObjValues ( safeObject ( obj ), ( item, name ) => `{${name}?:}` )
    }
  }
}
export function makeConditionToDisplayParentChildRefData ( m: Mereology, parentChild: ParentChild ) {
  const { parent, child } = parentChild
  return {
    [ `{${parent}:${parent}}` ]: { ...childFn ( safeObject ( m[ parent ]?.children?.[ child ]?.fields ), child ) }
  }
}

export function makeConditionToDisplayOneRefData ( m: Mereology, item: string ) {
  return {
    [ `{${item}:${item}}` ]: {
      ...mapObjValues ( safeObject ( m[ item ]?.fields ), ( field, name ) => `{${name}?:}` ),
    }
  }
}

export interface DisplayMereologyProps<Q extends any> {
  q: Q
}
export const displayMereology = ( dispMereologyProps: DisplayMereologyContext ) => {
  const { displayBindingProps, bc, r, m } = dispMereologyProps
  return <Q extends any> ( condFn: ( m: Mereology, query: Q ) => any, order: string[] ) => ( { q }: DisplayMereologyProps<Q> ) =>
    displayBindings ( displayBindingProps ) ( order ) ( evaluate ( bc, condFn ( m, q ) ) ( r ) );
}
