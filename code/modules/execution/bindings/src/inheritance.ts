import { NameAnd, NameAndValidator, validateArray, validateNameAnd, validateString } from "@runbook/utils";

export type InheritsFromFn = ( child: string, parent: string, knownType?: string ) => boolean

export const validateInheritanceDefn: NameAndValidator<NameAnd<string[]>> = validateNameAnd ( validateArray ( validateString () ) )