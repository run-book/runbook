import { composeNameAndValidators, KleisliWithErrors, NameAnd, NameAndValidator, orValidators, Primitive, validateChild, validateChildNumber, validateChildString, validateChildValue, validateNameAnd, validateString } from "@runbook/utils";
import { DisplayFormat } from "@runbook/displayformat";


export interface CommonInstrument {
  description: string,
  params: string | NameAnd<CleanInstrumentParam>,
  staleness?: number,
  cost?: InstrumentCost,
}
export interface CleanInstrumentParam {
  description?: string,
  default?: string
}
type InstrumentCost = "low" | "medium" | "high"

export interface ScriptAndDisplay {
  script: string | string[]
  format: DisplayFormat
  outputColumns?: string[],
}
// export type ExecuteCommonIntrumentK<I extends CommonInstrument> = ( context: string, i: I ) => KleisliWithErrors<NameAnd<Primitive>, any>
// export type ExecuteStriptInstrumentK<I extends CommonInstrument> = ( sdFn: ( i: I ) => ScriptAndDisplay ) => ExecuteCommonIntrumentK<I>

export const validateCleanInstrumentParam: NameAndValidator<CleanInstrumentParam> = composeNameAndValidators (
  validateChildString ( 'description' ),
  validateChildString ( 'default', true ),
)

export const validateCommonInstrument: NameAndValidator<CommonInstrument> = composeNameAndValidators<CommonInstrument> (
  validateChildString ( 'description' ),
  validateChild ( 'params', orValidators<any> ( '', validateNameAnd ( validateCleanInstrumentParam ), validateString () ) ),
  validateChildNumber ( 'staleness', true ),
  validateChildValue ( 'cost', "low", "medium", "high", undefined )
)
