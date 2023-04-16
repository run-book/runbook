import { composeNameAndValidators, NameAnd, validateAny, validateChild, validateChildItemOrArray, validateChildString, validateNameAnd, validateString } from "@runbook/utils";
import { Binding } from "@runbook/bindings";

export type Fetchers = NameAnd<Fetcher>

export interface IfTrue {
  "type": string,
  "name": string,
  "params": NameAnd<string> | '*'
  "addTo": any
}
export interface IfTrueBound extends IfTrue {
  binding: Binding
}
export interface Fetcher {
  condition: any;
  ifTrue: IfTrue;
}
export interface View {
  type: string;
  description: string | string[],
  usage: string | string[],
  preconditions: string | string[],
  fetchers: Fetchers
}

export const validateIfTrue = composeNameAndValidators<IfTrue> (
  validateChildString ( 'type' ),
  validateChildString ( 'name' ),
  validateChild ( 'params', validateAny () ),
  validateChild ( 'addTo', validateAny () )
)

export const validateFetcher = composeNameAndValidators<Fetcher> (
  validateChild ( 'condition', validateAny () ),
  validateChild ( 'ifTrue', validateIfTrue ) )

export const validateView = composeNameAndValidators<View> (
  validateChildString ( 'type' ),
  validateChildItemOrArray ( 'description', validateString () ),
  validateChildItemOrArray ( 'usage', validateString () ),
  validateChildItemOrArray ( 'preconditions', validateString () ),
  validateChildItemOrArray ( 'fetchers', validateNameAnd ( validateFetcher ) )
)