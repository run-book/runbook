import { composeNameAndValidators, NameAnd, NameAndValidator, safeObject, validateAny, validateArray, validateChild, validateChildItemOrArray, validateChildString, validateNameAnd, validateObject, validateString } from "@runbook/utils";


export interface MereologyField {
  description: string
}
export interface MerologyItem {
  children: Mereology
  fields: NameAnd<MereologyField>
}

export type Mereology = NameAnd<MerologyItem>

export function nameSpaceFrom ( s: string ) {
  const index = s.indexOf ( ':' )
  if ( index === -1 ) return undefined
  return s.substring ( index + 1 )
}


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
    // validateChild ( 'displayOrder', validateArray ( validateString () ), true ),
    validateChild ( 'children', validateNameAnd ( validateAny () ), true ), // need to handle this recursion
    validateChild ( 'fields', validateNameAnd ( validateMerologyField ), true ) )
}
export const validateMereology: NameAndValidator<Mereology> = validateNameAnd ( validateMerologyItem () )
