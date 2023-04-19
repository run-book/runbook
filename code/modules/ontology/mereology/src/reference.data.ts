import { composeNameAndValidators, deepCombineTwoObjects, NameAnd, NameAndValidator, validateAny, validateChild, validateNameAnd, validateNumber } from "@runbook/utils";
import { NameSpaceAndValue } from "./mereology";

/** The mereology is just 'if we see this name, then we use the reference data about the name' */
export type ReferenceData = {
  direct?: NameAnd<any>,
  bound?: NameAnd<NameAnd<ReferenceData>>
}
export type FromReferenceDataFn = ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => any
export const fromReferenceData = ( mereology: ReferenceData ): FromReferenceDataFn => ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => {
  if ( !mereology ) return undefined;
  const direct: NameAnd<any> = mereology.direct?.[ searchNameSpace ]?.[ searchValue ]
  const fromBindings: NameAnd<any>[] = existing.map ( ( { namespace, value } ) => {
    if (namespace===undefined ||  mereology.bound===undefined) return undefined;
    if ( typeof value !== 'string' ) return []
    const childMereology: ReferenceData = mereology.bound?.[ namespace ]?.[ value ]
    const withoutMe = existing.filter ( e => e.namespace !== namespace || e.value !== value )
    const result = fromReferenceData ( childMereology ) ( withoutMe, searchNameSpace, searchValue );
    return result
  } )
  return fromBindings.reduce ( ( acc, val ) => deepCombineTwoObjects ( acc, val ), direct )
};

export const validateReferenceData: NameAndValidator<ReferenceData> = composeNameAndValidators (
  validateChild ( 'direct', validateNameAnd ( validateAny<any> () ), true ),
  validateChild ( 'bound', validateNameAnd ( validateNameAnd ( validateAny () ) ), true ) )