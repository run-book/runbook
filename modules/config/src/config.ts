import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { View } from "@runbook/views";
import { Mereology, ReferenceData } from "@runbook/mereology";


export const runbookMarker = ".runbook"
export const configFileName = "runbook.json"
export interface Config {

}


export type CleanInstrument = ScriptInstrument


export interface CleanConfig {
  instruments: NameAnd<CleanInstrument>
  mereology: Mereology
  reference: ReferenceData
  inheritance: NameAnd<string[]>
  views: NameAnd<View>
  situation: any
}



