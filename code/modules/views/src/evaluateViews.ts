import { IfTrue, IfTrueBound, View } from "./views";
import { flatten, fromEntries, mapObjToArray, mapObjValues, NameAnd, NameAndParams, Primitive, safeArray } from "@runbook/utils";
import { Binding, BindingContext, evaluate } from "@runbook/bindings";
import { bracesVarDefn, derefence } from "@runbook/variables";

export interface TrueCondition {

}
function makeParams ( ifTrue: IfTrue, context: string, binding: Binding ) {
  const params = ifTrue.params
  return params === '*'
    ? params
    : mapObjValues ( params, param => derefence ( context, bindingsToDictionary ( binding ), param, { variableDefn: bracesVarDefn } ) );
}
export const applyTrueConditions = ( fixtureView: View ) => ( results: NameAnd<EvaluateViewConditionResult> ): NameAnd<IfTrueBound[]> => {
  const ifTrues = mapObjValues ( fixtureView.fetchers, fetcher => fetcher.ifTrue )
  let result: NameAnd<IfTrueBound[]> = mapObjValues ( ifTrues, ( ifTrue, name ) => {
    const trueBindings = safeArray ( results[ name ].bindings )
    const context = `Applying true condition ${name}`
    return trueBindings.map ( binding => ({
      ...ifTrue, binding, params: makeParams ( ifTrue, context, binding )
    }) )
  } );
  return result
};
export function bindingsToDictionary ( binding: Binding ): NameAnd<Primitive> {
  const res: NameAnd<Primitive> = mapObjValues ( binding, ( binding, name ) => binding.value )
  return res
}

export interface EvaluateViewConditionResult {
  bindings: Binding[],
  instrumentName: string
}
export const evaluateViewConditions = ( bc: BindingContext, fixtureView: View ): ( situation: any ) => NameAnd<EvaluateViewConditionResult> => {
  const evaluators: NameAnd<( situation: any ) => EvaluateViewConditionResult> =
          mapObjValues ( fixtureView.fetchers, fetcher => {
            return sit => ({ bindings: evaluate ( bc, fetcher.condition ) ( sit ), instrumentName: fetcher.ifTrue.name })
          } )
  return ( situation: any ) => {
    const result = mapObjValues ( evaluators, evaluator => evaluator ( situation ) )
    return result
  };
};

export function makeExecuteFrom ( results: NameAnd<EvaluateViewConditionResult> ) {
  let l: [ string, NameAndParams ][][] = mapObjToArray<EvaluateViewConditionResult, [ string, NameAndParams ][]> ( results, ( result, name ) =>
    result.bindings.map ( ( binding, i ) => {
      const id = `${name}${i}`
      return [ id, { name: result.instrumentName, params: mapObjValues ( binding, b => b.value ) } ]
    } ) );
  return fromEntries ( flatten<[ string, NameAndParams ]> ( l ));
}