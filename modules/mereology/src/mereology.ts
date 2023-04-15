import { deepCombineTwoObjects, NameAnd, Primitive } from "@runbook/utils";


/** the first name is the name of the namespace, the second name is the name of the thing in that namespace,
 * after that we get data for that thing. See mereology.spec.ts for example */
export type MereologyDefn = NameAnd<NameAnd<any>>

export type NameSpaceAndValue = { namespace?: string, value: Primitive } //the value is the name...

/** The mereology is just 'if we see this name, then we use the reference data about the name' */
export type ReferenceData = {
  direct?: NameAnd<any>,
  bound?: NameAnd<NameAnd<ReferenceData>>
}
/** Actually type Mereology = NameAnd<Mereology> but typescript doesn't allow this */
export type Mereology = NameAnd<any>
export function toMereology ( defn: MereologyDefn ): ReferenceData {
  const mereology: ReferenceData = {}
  Object.entries ( defn ).forEach ( ( [ namespace, namespaceDefn ] ) =>
    Object.entries ( namespaceDefn ).forEach ( ( [ name, data ] ) =>
      mereology[ name ] = deepCombineTwoObjects ( mereology[ name ], data ) ) )
  return mereology
}

export type FromMereologyFn = ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => any
export const fromMereology = ( mereology: ReferenceData ): FromMereologyFn => ( existing: NameSpaceAndValue[], searchNameSpace: string, searchValue: string ) => {
  if ( !mereology ) return undefined;
  const direct: NameAnd<any> = mereology.direct?.[ searchNameSpace ]?.[ searchValue ]
  const fromBindings: NameAnd<any>[] = existing.map ( ( { namespace, value } ) => {
    if ( typeof value !== 'string' ) return []
    const childMereology: ReferenceData = mereology.bound[ namespace ]?.[ value ]
    const withoutMe = existing.filter ( e => e.namespace !== namespace || e.value !== value )
    const result = fromMereology ( childMereology ) ( withoutMe, searchNameSpace, searchValue );
    return result
  } )
  return fromBindings.reduce ( ( acc, val ) => deepCombineTwoObjects ( acc, val ), direct )
};
