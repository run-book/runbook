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
  instruments: NameAnd<CleanInstrument>
  mereology: Mereology
  reference: ReferenceData
  inheritance: NameAnd<string[]>
  views: NameAnd<View>
  situation: any
}
export const validateCleanInstrument = validateScriptInstrument


export const validateConfig: NameAndValidator<CleanConfig> = composeNameAndValidators (
  validateChild ( 'instruments', validateNameAnd ( validateCleanInstrument ) ),
  validateChild ( 'mereology', validateMereology ),
  validateChild ( 'views', validateNameAnd ( validateView ) ),
  validateChild ( 'inheritance', validateNameAnd ( validateArray ( validateString () ) ) ),
  validateChild ( 'reference', validateReferenceData ),
  validateChild ( 'instruments', validateNameAnd ( validateCleanInstrument ) )
)



