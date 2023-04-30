import { composeNameAndValidators, NameAnd, NameAndValidator, safeObject, validateAny, validateChild, validateChildString, validateNameAnd, validateObject } from "@runbook/utils";


export interface MereologyField {
  description: string
}
export interface MerologyItem {
  children: Mereology
  fields: NameAnd<MereologyField>
}

export type Mereology = NameAnd<MerologyItem>


export function mereologyToSummary ( m: Mereology ): NameAnd<string[]> {
  const result: NameAnd<string[]> = {}
  function doOne ( m: Mereology ) {
    for ( let name in m ) {
      const child = m[ name ]
      result[ name ] = Object.keys ( safeObject ( child.children ) )
      doOne ( child.children )
    }
  }
  doOne ( m )
  return result
}

export const validateMerologyField: NameAndValidator<MereologyField> = validateChildString ( 'description' )
export function validateMerologyItem (): NameAndValidator<MerologyItem> {
  return composeNameAndValidators (
    validateObject (),
    validateChild ( 'children', validateNameAnd ( validateAny () ), true ), // need to handle this recursion
    validateChild ( 'fields', validateNameAnd ( validateMerologyField ), true ) )
}
export const validateMereology: NameAndValidator<Mereology> = validateNameAnd ( validateMerologyItem () )
