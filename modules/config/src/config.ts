import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";


export const runbookMarker = ".runbook"
export const configFileName = "runbook.json"
export interface Config {

}



export type CleanInstrument = ScriptInstrument


export interface CleanConfig {
  instruments: NameAnd<CleanInstrument>
}