import { composeNameAndValidators, NameAnd, NameAndValidator, validateAny, validateArray, validateChild, validateHasAtLeastOneKey, validateNameAnd, validateString } from "@runbook/utils";
import { ScriptInstrument, validateScriptInstrument } from "@runbook/scriptinstruments";
import { validateView, View } from "@runbook/views";
import { Mereology, validateMereology } from "@runbook/mereology";
import { ReferenceData, validateReferenceData } from "@runbook/referencedata";


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


export const validateConfig = ( partial?: true ): NameAndValidator<CleanConfig> => composeNameAndValidators (
  validateChild ( 'instrument', validateNameAnd ( validateCleanInstrument ), partial ),
  validateChild ( 'mereology', validateMereology, partial ),
  validateChild ( 'view', validateNameAnd ( validateView ), partial ),
  validateChild ( 'inheritance', validateNameAnd ( validateArray ( validateString () ) ), partial ),
  validateChild ( 'reference', validateReferenceData, partial ),
  validateChild ( 'instrument', validateNameAnd ( validateCleanInstrument ), partial ),
  validateChild ( 'situation', validateNameAnd ( validateAny () ), partial ),
)

export const validationConfigPartial: NameAndValidator<CleanConfig> = composeNameAndValidators<CleanConfig> (
  validateConfig ( true ),
  validateHasAtLeastOneKey ( '' ) ( 'instrument', 'mereology', 'view', 'inheritance', 'reference', 'instrument', 'situation' )
)


