export type Condition = RootCondition | AndCondition
//cheap and dirty parser to explore the ideas

export type ConditionPathSection = ValuePS | VariablePs

export interface InheritsPs {
  isa?: string
}
export interface ConditionPs {
  condition?: { type: '=', '>', '<', value: string }
}
export function isConditionPs ( ps: any ): ps is ConditionPs {
  return 'condition' in ps
}

export interface ValuePS extends InheritsPs, ConditionPs {
  value: string
}
export function isValuePS ( ps: ConditionPathSection ): ps is ValuePS {
  return 'value' in ps
}
export interface VariablePs extends InheritsPs, ConditionPs {
  variable: string
}
export function isVariablePs ( ps: ConditionPathSection ): ps is VariablePs {
  return 'variable' in ps
}
export interface RootCondition {
  type: 'root'
  path: ConditionPathSection[]
}
export function isRootCondition ( c: Condition ): c is RootCondition {
  return c.type === 'root'
}
export interface AndCondition {
  type: 'and'
  conditions: Condition[]
}
export function isAndCondition ( c: Condition ): c is AndCondition {
  return c.type === 'and'
}

export interface NewCondition{
  type: 'new'
}
