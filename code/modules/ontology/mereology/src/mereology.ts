import { deepCombineTwoObjects, NameAnd, NameAndValidator, Primitive, validateArray, validateNameAnd, validateString } from "@runbook/utils";
import { ReferenceData } from "./reference.data";


/** the first name is the name of the namespace, the second name is the name of the thing in that namespace,
 * after that we get data for that thing. See mereology.spec.ts for example */
export type MereologyDefn = NameAnd<NameAnd<any>>

export type NameSpaceAndValue = { namespace?: string, value: Primitive } //the value is the name...

/** for example
 * mereology = {"environment": ["service", "database"]}
 */
export type Mereology = NameAnd<string[]>
export function toMereology ( defn: MereologyDefn ): ReferenceData {
  const mereology: ReferenceData = {}
  Object.entries ( defn ).forEach ( ( [ namespace, namespaceDefn ] ) =>
    Object.entries ( namespaceDefn ).forEach ( ( [ name, data ] ) =>
      mereology[ name ] = deepCombineTwoObjects ( mereology[ name ], data ) ) )
  return mereology
}


export const validateMereology: NameAndValidator<Mereology> = validateNameAnd ( validateArray ( validateString () ) )
