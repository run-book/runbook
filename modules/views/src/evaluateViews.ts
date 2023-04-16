import { IfTrue, IfTrueBound, View } from "./views";
import { mapObjValues, NameAnd, Primitive, safeArray } from "@runbook/utils";
import { Binding, BindingContext, evaluate } from "@runbook/bindings";
import { bracesVarDefn, derefence } from "@runbook/variables";

export interface TrueCondition {

}
export const applyTrueConditions = ( fixtureView: View ) => ( bindings: NameAnd<Binding[]> ): NameAnd<IfTrueBound[]> => {
  const ifTrues = mapObjValues ( fixtureView.fetchers, fetcher => fetcher.ifTrue )
  let result: NameAnd<IfTrueBound[]> = mapObjValues ( ifTrues, ( ifTrue, name ) => {
    const trueBindings = safeArray ( bindings[ name ] )
    const context = `Applying true condition ${name}`
    return trueBindings.map ( binding => ({
      ...ifTrue, binding, params: mapObjValues ( ifTrue.params, param =>
        derefence ( context, bindingsToDictionary ( binding ), param, { variableDefn: bracesVarDefn } ) )
    }) )
  } );
  return result
};
export function bindingsToDictionary ( binding: Binding ): NameAnd<Primitive> {
  const res: NameAnd<Primitive> = mapObjValues ( binding, ( binding, name ) => binding.value )
  return res
}
export const evaluateViewConditions = ( bc: BindingContext, fixtureView: View ): ( situation: any ) => NameAnd<Binding[]> => {
  const evaluators: NameAnd<( situation: any ) => Binding[]> = mapObjValues ( fixtureView.fetchers, fetcher => evaluate ( bc, fetcher.condition ) )
  return ( situation: any ) => {
    const result = mapObjValues ( evaluators, evaluator => evaluator ( situation ) )
    return result
  };
};
