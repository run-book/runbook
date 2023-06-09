import { flatMap } from "./list";
import { flatMapEntries, NameAnd } from "./nameAnd";
import { isPrimitive, Primitive } from "./types";
import { indentAll } from "./strings";


export type Validator<T> = ( value: T ) => string[]
export type NameAndValidator<T> = ( name: string ) => ( value: T | undefined ) => string[]

export function validateIsType ( expected: string, allowUndefined?: true ): NameAndValidator<any> {
  return ( name ) => ( value ) => {
    if ( value === undefined ) return allowUndefined ? [] : [ `${name} is undefined. It should be a ${expected}` ];
    return typeof value === expected ? [] : [ `${name} is [${JSON.stringify ( value )}] which is a ${typeof value} and not a ${expected}` ];
  }
}

export function validateNotArray ( allowUndefined?: true ): NameAndValidator<string> {
  return name => value => Array.isArray ( value ) ? [ `${name} is an array` ] : []
}
export const validateObject = ( allowUndefined?: true ): NameAndValidator<any> =>
  composeNameAndValidators ( validateNotArray ( allowUndefined ), validateIsType ( 'object' ) )

export const validateString = ( allowUndefined?: true ): NameAndValidator<string> => validateIsType ( 'string', allowUndefined );
export const validateNumber = ( allowUndefined?: true ): NameAndValidator<number> => validateIsType ( 'number', allowUndefined );
export const validateBoolean = ( allowUndefined?: true ): NameAndValidator<boolean> => validateIsType ( 'boolean', allowUndefined );

export const validateDefined: NameAndValidator<any> = ( name ) => ( value ) => value === undefined ? [ `${name} is undefined` ] : [];
export function validateValue<T> ( ...values: (T | undefined)[] ): NameAndValidator<T> {
  return ( name ) => ( value: T | undefined ) => values.includes ( value ) ? [] : [ `${name} is [${JSON.stringify ( value )}] not one of ${JSON.stringify ( values )}` ];
}

export function composeValidators<T> ( ...fns: Validator<T>[] ): Validator<T> {
  return ( value: T ) => flatMap ( fns, v => v ( value ) );
}
export function composeNameAndValidators<T> ( ...fns: NameAndValidator<T>[] ): NameAndValidator<T> {
  return ( name: string ) => ( value: T | undefined ) => flatMap ( fns, v => v ( name ) ( value ) );
}
export function orValidators<T> ( msg: string, ...fns: NameAndValidator<T>[] ): NameAndValidator<T> {
  return ( name: string ) => ( value: T | undefined ) => {
    if ( fns.length === 0 ) return []
    const errors = fns.map ( fn => fn ( name ) ( value ) )
    const ok = errors.some ( e => e.length === 0 )
    if ( ok ) return []
    return flatMap ( errors, ( e, i ) => {
      const thisMsg = i === 0 ? `${name} ${msg}. Either` : `or`;
      return e.length === 0 ? [] : [ thisMsg, ...indentAll ( e ) ];
    } )
  };
}
export function validateItemOrArray<T> ( validator: NameAndValidator<T>, allowUndefined?: true ): NameAndValidator<T | T[]> {
  return ( name ) => ( value: undefined | T | T[] ) => {
    if ( value === undefined ) return allowUndefined ? [] : [ `${name} is undefined` ];
    let i = 0;
    if ( Array.isArray ( value ) ) return flatMap ( value, validator ( `${name}[${i++}]` ) );
    return validator ( name ) ( value );
  };
}
export function validateArray<T> ( validate: NameAndValidator<T>, allowUndefined?: true ): NameAndValidator<T[]> {
  return ( name ) => ( value: T[] | undefined ) => {
    if ( value === undefined ) return allowUndefined ? [] : [ `${name} is undefined` ];
    if ( isPrimitive ( value ) ) return [ `${name} is of type ${typeof value} and not an array` ]
    let i = 0;
    if ( Array.isArray ( value ) ) return flatMap ( value, validate ( `${name}[${i++}]` ) );
    return [ `${name} is not an array` ];
  }
}

export function validateChildItemOrArray<Main, K extends keyof Main> ( key: K, validator: NameAndValidator<any>, allowUndefined?: true ): NameAndValidator<Main> {
  return validateChild ( key, validateItemOrArray ( validator ), allowUndefined );
}

export function validateChild<Main, K extends keyof Main> ( key: K, validator: NameAndValidator<Main[K]>, allowUndefined?: boolean ): NameAndValidator<Main> {
  return ( name ) => ( value: Main | undefined ) => {
    if ( isPrimitive ( value ) ) return [ `${name} does not have ${key.toString ()} as it is of type ${typeof value} and not an object` ]
    let child = value[ key ];
    let newName = name + '.' + key.toString ();
    if ( child === undefined ) return allowUndefined ? [] : [ `${newName} is undefined` ];
    return validator ( newName ) ( child );
  };
}

export const validateHasAtLeastOneKey = ( hint: string ) => <Main, K extends keyof Main> ( ...keys: K[] ): NameAndValidator<Main> => ( name ) =>
  ( value: Main | undefined ) => {
    if ( isPrimitive ( value ) ) return [ `${name} does not have ${keys.toString ()} as it is of type ${typeof value} and not an object` ]
    for ( const key of keys ) {
      if ( value[ key ] !== undefined ) return [];
    }
    return [ `${name} does not have any of ${keys.toString ()}${hint}` ];
  };
export const validatePrimitive = ( allowUndefined?: true ): NameAndValidator<Primitive> => ( name ) => ( value ) =>
  isPrimitive ( value ) ? [] : [ `${name} is not a primitive` ];

export function validateNameAnd<T> ( validator: NameAndValidator<T>, allowUndefined?: true ): NameAndValidator<NameAnd<T> | undefined> {
  return name => ( value: NameAnd<T | undefined> | undefined ) => {
    if ( Array.isArray ( value ) ) return [ `${name} is an array and not an object` ]
    if ( value === undefined ) return allowUndefined ? [] : [ `${name} is undefined` ];
    if ( isPrimitive ( value ) ) return [ `${name} is of type ${typeof value} and not an object` ]
    return flatMapEntries ( value, ( t, n ) => t ? validator ( name + '.' + n ) ( t ) : [] );
  };
}
export function validateAny<T> (): NameAndValidator<T> {
  return () => () => []
}

export const validateChildString = <Main, K extends keyof Main> ( key: K, allowUndefined?: true ) => {
  return validateChild<Main, K> ( key, validateString () as any, allowUndefined );
}

export const validateOrString = <Main> ( validate: NameAndValidator<Main> ): NameAndValidator<Main | string> =>
  name => value => {
    if ( typeof value === 'string' ) return validateString () ( name ) ( value );
    return validate ( name ) ( value );
  }
export const validateChildValue = <Main, K extends keyof Main> ( key: K, ...legalValues: (Main[K] | undefined)[] ): NameAndValidator<Main> =>
  validateChild<Main, K> ( key, validateValue ( ...legalValues ) as any, legalValues.includes ( undefined ) )
export const validateChildNumber = <Main, K extends keyof Main> ( key: K, allowUndefined?: true ): NameAndValidator<Main> =>
  validateChild<Main, K> ( key, validateNumber ( allowUndefined ) as any, allowUndefined )

export const validateChildDefined = <Main, K extends keyof Main> ( key: K ): NameAndValidator<Main> => validateChild ( key, validateDefined as any )
export const validate = <Main, Res> ( name: string, validator: NameAndValidator<Main>, value: any, ifTrue: ( value: Main ) => Res, ifErrors: ( errors: string[] ) => Res ): Res => {
  const errorsOrValue = validator ( name ) ( value );
  return errorsOrValue.length > 0 ? ifErrors ( errorsOrValue ) : ifTrue ( value );
};