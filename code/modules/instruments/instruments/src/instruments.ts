import { KleisliWithErrors, NameAnd, Primitive } from "@runbook/utils";
import { DisplayFormat } from "@runbook/displayformat";


export interface CommonInstrument {
  description: string,
  params: string | NameAnd<CleanInstrumentParam>,
  staleness?: number,
  cost?: InstrumentCost,
  format: DisplayFormat,
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
export type ExecuteInstrumentK<I extends CommonInstrument> = ( context: string, i: I, sdFn: ( i: I ) => ScriptAndDisplay ) => KleisliWithErrors<NameAnd<Primitive>, any>
