import { KleisliWithErrors, NameAnd, Primitive } from "@runbook/utils";
import { DisplayFormat } from "@runbook/displayformat";

export interface CommonInstrument {
  description: string,
  params: NameAnd<CleanInstrumentParam>,
  staleness: number,
  cost: InstrumentCost,
  "format": DisplayFormat,
}
export interface CleanInstrumentParam {
  type: string,
  description: string,
  default: string
}
type InstrumentCost = "low" | "medium" | "high"

export type ExecuteInstrumentK<I extends CommonInstrument> = ( context: string, instrument: I ) => KleisliWithErrors<NameAnd<Primitive>, any>
