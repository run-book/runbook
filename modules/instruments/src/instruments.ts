import { NameAnd } from "@runbook/utils";

export interface CommonInstrument {
  description: string,
  params: NameAnd<CleanInstrumentParam>,
  staleness: number,
  cost: InstrumentCost,
  "format": InstrumentFormat,
}
export interface CleanInstrumentParam {
  type: string,
  description: string,
  default: string
}
type InstrumentCost = "low" | "medium" | "high"
type InstrumentFormat = "table" | "tablenoheader" | "json" | "onelinejson"

