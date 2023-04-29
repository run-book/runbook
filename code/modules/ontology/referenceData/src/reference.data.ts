import { composeNameAndValidators, deepCombineTwoObjects, NameAnd, NameAndValidator, NameSpaceAndValue, validateAny, validateNameAnd } from "@runbook/utils";


export type ReferenceData = NameAnd<any>
export type FromReferenceDataFn = ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => any

//TODO can clean this signature up a bit. Don't need separate searchNameSpace/searchValue
export const fromReferenceData = ( refData: ReferenceData ): FromReferenceDataFn => ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => {
  if ( !refData ) return undefined;
  const nsAndName = `${searchValue}:${searchNameSpace}`
  const direct: NameAnd<any> = refData[ nsAndName ]
  const fromBindings: NameAnd<any>[] = existing.map ( ( { namespace, value } ) => {
    if ( namespace === undefined ) return undefined;
    const nsAndName = `${value}:${namespace}`
    if ( typeof value !== 'string' ) return []
    const childMereology: ReferenceData = refData[ nsAndName ]
    const withoutMe = existing.filter ( e => e.namespace !== namespace || e.value !== value )
    const result = fromReferenceData ( childMereology ) ( withoutMe, searchNameSpace, searchValue );
    return result
  } )
  return fromBindings.reduce ( ( acc, val ) => deepCombineTwoObjects ( acc, val ), direct )
};

export const validateReferenceData: NameAndValidator<ReferenceData> = composeNameAndValidators (
  validateNameAnd ( validateAny<any> () ) )
