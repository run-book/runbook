import { NameAnd, NameAndValidator, validateArray, validateNameAnd, validateString } from "@runbook/utils";


/** for example
 * mereology = {"environment": ["service", "database"]}
 */
export type Mereology = NameAnd<string[]>

export const validateMereology: NameAndValidator<Mereology> = validateNameAnd ( validateArray ( validateString () ) )
