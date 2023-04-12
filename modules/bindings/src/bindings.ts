import { AndCondition, Condition, ConditionPathSection, isConditionPs, isRootCondition, isValuePS, isVariablePs, RootCondition } from "@runbook/conditions";
import { flatMap, validate } from "@runbook/utils";
import { StringDag } from "./inheritance";

// A cheap and dirty evaluator

export interface BindingContext {
  inheritance: StringDag
}

export function isA ( context: BindingContext, name: string, isa: string ): boolean {
  return context.inheritance.parents[ name ]?.includes ( isa )
}

export function matchesIsA ( bc: BindingContext, part: ConditionPathSection, value: string ): boolean {
  return part.isa ? isA ( bc, value, part.isa ) : true;
}

export function matchEquals ( part: ConditionPathSection, value: string ): boolean {
  if ( isConditionPs ( part ) ) return part.condition?.type === '=' && part.condition.value === value.toString ();
  return true
}
export function evaluatePath ( bc: BindingContext, condition: RootCondition, conditionIndex: number, path: string[], index: number, data: any ): RootBinding[] {
  if ( index >= condition.path.length ) return [ { conditionIndex, path } ]
  if ( typeof data !== 'object' || data === null ) return [];
  const part = condition.path[ index ]
  if ( isValuePS ( part ) ) return part.value in data && matchesIsA ( bc, part, part.value ) && matchEquals ( part, data[ part.value ] ) ?
    evaluatePath ( bc, condition, conditionIndex, path.concat ( part.value ), index + 1, data[ part.value ] ) : [];
  if ( isVariablePs ( part ) ) return flatMap ( Object.keys ( data ), key =>
    matchesIsA ( bc, part, key ) && matchEquals ( part, data[ key ] ) ? evaluatePath ( bc, condition, conditionIndex, path.concat ( key ), index + 1, data[ key ] ) : [] )
  throw new Error ( `Unknown condition path section: ${JSON.stringify ( part )}` )
}
export function evaluateRootCondition ( context: BindingContext, c: RootCondition, conditionIndex: number, data: any ): any {
  return evaluatePath ( context, c, conditionIndex, [], 0, data )
}
export function evaluateRootConditions ( context: BindingContext, cs: RootCondition[], data: any ): Binding[] {
  return flatMap ( cs, ( c, i ) => evaluateRootCondition ( context, c, i, data ) )
}

export function evaluateAndCondition ( context: BindingContext, bindings: Binding[], andCondition: AndCondition, conditionIndex: number, data: any ): any {
  return []
}

interface RootBinding {
  conditionIndex: number,
  path: string[]
}
interface AndBinding {
  conditionIndex: number,
}
export type Binding = RootBinding | AndBinding;