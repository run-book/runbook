import { NameAnd, NameAndValidator, Primitive, validateArray, validateNameAnd, validateString } from "@runbook/utils";


/** the first name is the name of the namespace, the second name is the name of the thing in that namespace,
 * after that we get data for that thing. See mereology.spec.ts for example */
export type MereologyDefn = NameAnd<NameAnd<any>>


/** for example
 * mereology = {"environment": ["service", "database"]}
 */
export type Mereology = NameAnd<string[]>

export const validateMereology: NameAndValidator<Mereology> = validateNameAnd ( validateArray ( validateString () ) )
