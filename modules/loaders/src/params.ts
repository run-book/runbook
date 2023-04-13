import { flatMap, NameAnd, objsEqualOrMessages, Primitive } from "@runbook/utils";

/** A param is used to parameterise a loader. It can be a string, number or boolean */
export type Param = Primitive
export type Params = NameAnd<Param>

/** We need to be able to get the params from the state */
export type ParamsGetterFn<State> = ( state: State ) => Params | undefined
export type ParamGetterFn<State> = ( state: State ) => Param


export function paramsEqualsWithMessagesIfNot ( name: string, recordedParams: Params, existingParams: Params ): string[] {
  const msgs = objsEqualOrMessages ( {
    oneIsNull: `No recorded params for ${name}`,
    twoIsNull: `No existing params for ${name}  `,
    lengthMismatch: ( one, two ) => `Params for ${name} differ in length. Recorded: ${one}, Existing: ${two}`,
    keyMismatch: ( one, legal ) => `Cannot find param ${one} in existing params for ${name}. Legal params are ${legal.join ( ', ' )}`,
    valueMismatch: ( one, two ) => ''
  }, recordedParams, existingParams )
  return msgs
}