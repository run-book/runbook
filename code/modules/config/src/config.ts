import { composeNameAndValidators, NameAnd, NameAndValidator, validateArray, validateChild, validateNameAnd, validateString } from "@runbook/utils";
import { ScriptInstrument, validateScriptInstrument } from "@runbook/scriptinstruments";
import { validateView, View } from "@runbook/views";
import { Mereology, ReferenceData, validateMereology, validateReferenceData } from "@runbook/mereology";


export const runbookMarker = ".runbook"
export const configFileName = "runbook.json"
export interface Config {

}


export type CleanInstrument = ScriptInstrument


export interface CleanConfig {
  instrument: NameAnd<CleanInstrument>
  mereology: Mereology
  reference: ReferenceData
  inheritance: NameAnd<string[]>
  view: NameAnd<View>
  situation: any
}
export const validateCleanInstrument = validateScriptInstrument


export const validateConfig: NameAndValidator<CleanConfig> = composeNameAndValidators (
  validateChild ( 'instrument', validateNameAnd ( validateCleanInstrument ) ),
  validateChild ( 'mereology', validateMereology ),
  validateChild ( 'view', validateNameAnd ( validateView ) ),
  validateChild ( 'inheritance', validateNameAnd ( validateArray ( validateString () ) ) ),
  validateChild ( 'reference', validateReferenceData ),
  validateChild ( 'instrument', validateNameAnd ( validateCleanInstrument ) )
)



