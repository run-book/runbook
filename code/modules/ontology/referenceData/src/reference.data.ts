import { collectObjValues, composeNameAndValidators, deepCombineTwoObjects, flatMapEntries, mapObjToArray, mapObjValues, NameAnd, NameAndValidator, NameSpaceAndValue, validateAny, validateNameAnd } from "@runbook/utils";
import { ref } from "@runbook/fixtures";


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

export const allDataFor = ( refData: ReferenceData ) => ( thing: string ): any => {
  if ( refData === undefined || typeof refData !== 'object' ) return {}
  const result: NameAnd<any> = {}

  const found = refData[ thing ]
  if ( found ) result[ thing ] = found
  for ( let name in refData ) {
    const refValue = allDataFor ( refData[ name ] ) ( thing )
    if ( Object.keys ( refValue )?.length > 0 ) result[ name ]= refValue
  }
  return result
};

export const validateReferenceData: NameAndValidator<ReferenceData> = composeNameAndValidators (
  validateNameAnd ( validateAny<any> () ) )
