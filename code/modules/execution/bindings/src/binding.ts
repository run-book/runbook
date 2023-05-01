import { flatMap, isPrimitive, NameAnd, NameSpaceAndValue, Primitive, safeArray } from "@runbook/utils";
import { InheritsFromFn } from "./inheritance";
import { deepSortCondition } from "./condition";
import { FromReferenceDataFn } from "@runbook/referencedata";

const idAndInheritsFrom = /^\{([a-zA-Z0-9]*)(\?)?:?([a-zA-Z0-9]*)}$/
export function parseBracketedString ( path: string[], s: string ): VarNameAndInheritsFrom {
  const matches = idAndInheritsFrom.exec ( s )
  if ( !matches ) throw new Error ( `Invalid variable at ${path} -- ${s}` )
  const varName = matches[ 1 ]
  const optional = matches[ 2 ]
  const inheritsFrom = matches[ 3 ]
  return { varName, inheritsFrom, optional: optional === '?' }
}
const isVariable = ( condK: string ) => typeof condK === 'string' && condK.startsWith ( '{' ) && condK.endsWith ( '}' );



export type Binding = NameAnd<PathAndValue>

export interface PathAndValue extends NameSpaceAndValue {
  namespace?: string
  value: Primitive
  path: string[]
}
export interface BindingContext {
  inheritsFrom: InheritsFromFn
  mereology: NameAnd<string[]>
  refDataFn: FromReferenceDataFn
  debug?: boolean
  debugIndent?: number
}
function indent ( bc: BindingContext ) {
  return bc.debugIndent ? bc.debugIndent : 0;
}
function debug ( bc: BindingContext, ...args: any[] ) {
  if ( bc.debug ) console.log ( ''.padEnd ( indent ( bc ) ), ...args )
}
function debugAndIndent ( bc: BindingContext, ...args: any[] ): BindingContext {
  if ( bc.debug ) return ({ ...bc, debugIndent: indent ( bc ) + 1 })
  if ( bc.debug && args.length > 0 ) debug ( bc, ...args )
  return bc
}


function valueFrom ( s: Primitive ): Primitive {
  if ( typeof s !== 'string' ) return s
  const index = s.indexOf ( ':' )
  if ( index === -1 ) return s
  return s.substring ( 0, index )
}

interface VarNameAndInheritsFrom {
  varName: string
  inheritsFrom: string
  optional?: boolean
}
interface MatchsPrimitive {
  varNameAndInheritsFrom?: VarNameAndInheritsFrom
  binding: Binding
}

export let makeVarNameAndInheritsFromCount = 0
const matchVariable = ( bc: BindingContext, condition: string, condPath: string[] ) => {
  const varNameAndInheritsFrom = parseBracketedString ( condPath, condition )
  makeVarNameAndInheritsFromCount++
  const { varName, inheritsFrom } = varNameAndInheritsFrom
  return ( path: string[], situation: Primitive, binding: Binding ) => {
    if ( inheritsFrom.length > 0 ) {
      if ( typeof situation !== 'string' ) return undefined;
      const inherits = bc.inheritsFrom ( situation, inheritsFrom );
      if ( !inherits ) return undefined;
    }
    const newBinding: Binding = { ...binding }
    newBinding[ varName ] = { path, value: valueFrom ( situation ), namespace: (inheritsFrom?.length > 0 ? inheritsFrom : undefined) }
    return { binding: newBinding, varNameAndInheritsFrom }
  };
};
const matchPrimitiveAndAddBindingIfNeeded = ( bc: BindingContext, condition: Primitive, condPath: string[] ) => {
  return typeof condition === 'string' && condition.startsWith ( '{' ) && condition.endsWith ( '}' )
    ? matchVariable ( bc, condition, condPath )
    : ( path: string[], situation: Primitive, binding: Binding ): MatchsPrimitive | undefined =>
      condition === situation ? { binding } : undefined
};

type OnFoundFn = ( b: Binding[], thisBinding: Binding ) => Binding[]
type OnFoundContinuation = ( onfound: OnFoundFn ) => ( oldPath: string[], situation: any ) => OnFoundFn
const checkSituationMatchesCondition = ( bc: BindingContext, condK: string, condV: any, condPath: string[] ) => {
        const matchPrim = matchPrimitiveAndAddBindingIfNeeded ( bc, condK, condPath );
        const optParsedCondV = isVariable ( condV ) ? parseBracketedString ( condPath, condV ) : undefined

        const matchAndContinue = matchUntilLeafAndThenContinue ( bc, condV, condPath );
        return ( continuation: OnFoundFn ) => {
          const matchAndContinueWithContinuation = matchAndContinue ( continuation );
          return ( oldPath: string[], sitV: string, sitK: any ): OnFoundFn => {
            const path = [ ...oldPath, sitK ]
            const matchWithSituation = matchAndContinueWithContinuation ( path, sitV );
            return ( bindings: Binding[], thisBinding: Binding ): Binding[] => {
              if ( sitV === undefined ) {
                if ( optParsedCondV && optParsedCondV.optional ) {
                  const newBinding = { ...thisBinding }
                  newBinding[ optParsedCondV.varName ] = { path, value: undefined, namespace: (optParsedCondV.inheritsFrom?.length > 0 ? optParsedCondV.inheritsFrom : undefined) }
                  return continuation ( bindings, newBinding )
                }
                return bindings;
              }
              const matchsPrimitive: MatchsPrimitive | undefined = matchPrim ( path, sitK, thisBinding )
              if ( matchsPrimitive === undefined ) return bindings
              const result = matchWithSituation ( bindings, matchsPrimitive.binding );
              if ( result && result.length === bindings.length && matchsPrimitive.varNameAndInheritsFrom ) {//OK we didn't match in the situation. Maybe we can match in the mereology?
                const { inheritsFrom } = matchsPrimitive.varNameAndInheritsFrom
                const inMere = bc.refDataFn ( Object.values ( thisBinding ), inheritsFrom, sitK )
                if ( inMere === undefined ) return bindings
                const mereologyResult = matchAndContinueWithContinuation ( path, inMere ) ( bindings, matchsPrimitive.binding )
                return mereologyResult === undefined ? bindings : mereologyResult;
              }
              return result || bindings;
            };
          };
        };
      }
;
const checkOneKvForVariable = ( bc: BindingContext, condK: string, condV: any, condPath: string[] ) => {
  let matcher = checkSituationMatchesCondition ( bc, condK, condV, condPath );
  return ( continuation: OnFoundFn ) => {
    let withContinuation = matcher ( continuation );
    return ( oldPath: string[], situation: any ) => ( bindings: Binding[], thisBinding: Binding ) =>
      flatMap ( Object.entries ( situation ), ( [ sitK, sitV ]: [ string, any ] ) =>
        withContinuation ( oldPath, sitV, sitK ) ( bindings, thisBinding ) );
  };
};
const checkOneKvForNonVariable = ( bcIndented: BindingContext, condK: string, condV: any, condPath: string[] ) => {
  const checker = checkSituationMatchesCondition ( bcIndented, condK, condV, condPath );
  return ( continuation: OnFoundFn ) => {
    const withContinuation = checker ( continuation );
    return ( oldPath: string[], situation: any ) => withContinuation ( oldPath, situation?.[ condK ], condK );
  };
};
const checkOneKv = ( bcIndented: BindingContext, condK: string, condV: any, condPath: string[] ) => {
  const newCondPath = [ ...condPath, condK ]
  const checker = isVariable ( condK )
    ? checkOneKvForVariable ( bcIndented, condK, condV, newCondPath )
    : checkOneKvForNonVariable ( bcIndented, condK, condV, newCondPath )

  return ( continuation: OnFoundFn ) => {
    const withContinuation = checker ( continuation );
    return ( oldPath: string[], situation: any ) => withContinuation ( oldPath, situation );
  }
};
export let makeCount = 0;
const makeOnFoundToExploreObject = ( bc: BindingContext, condition: any, condPath: string[] ) => {
  const bcIndented = debugAndIndent ( bc, 'makeOnFoundToExploreObject', JSON.stringify ( condition ) )
  const sortedCondition = deepSortCondition ( bc.mereology, `condition ${JSON.stringify ( condition, null, 2 )}`, condition )
  const onFoundForEachEntry: OnFoundContinuation[] = Object.entries ( sortedCondition ).map ( ( [ condK, condV ] ) =>
    checkOneKv ( bcIndented, condK, condV, condPath ) )
  makeCount++
  return ( continuation: OnFoundFn ) => {
    //ideally we would do the reduction at 'compile time' i.e. above the return
    return ( oldPath: string[], situation: any ): OnFoundFn =>
      onFoundForEachEntry.reduce ( ( acc: OnFoundFn, v: OnFoundContinuation ) => v ( acc ) ( oldPath, situation ), continuation )
  };
};

type MatchFn = ( path: string[], situation: any ) => ( b: Binding[], thisBinding: Binding ) => Binding[] | undefined
const primitiveMatchFn = ( bcIndented: BindingContext, condition: any, condPath: string[] ): ( c: OnFoundFn ) => MatchFn => {
  const matcher = matchPrimitiveAndAddBindingIfNeeded ( bcIndented, condition, condPath );
  return ( continuation: OnFoundFn ): MatchFn => {
    return ( path: string[], situation: any ): OnFoundFn => ( bindings: Binding[], thisBinding: Binding ): Binding[] => {
      const matches = matcher ( path, situation, thisBinding )
      debug ( bcIndented, 'isPrimitive', JSON.stringify ( condition ), JSON.stringify ( situation ), JSON.stringify ( matches ) )
      return matches ? continuation ( bindings, matches.binding ) : [];
    }
  };
};
const objectMatchFn = ( bcIndented: BindingContext, condition: any, condPath: string[] ) => {
  const maker = makeOnFoundToExploreObject ( bcIndented, condition, condPath );
  return ( continuation: OnFoundFn ) => {
    const withContinuation = maker ( continuation );
    return ( path: string[], situation: any ): OnFoundFn => ( b: Binding[], thisBinding: Binding ): Binding[] => {
      if ( Array.isArray ( situation ) ) throw new Error ( `Can't handle arrays yet` )
      return withContinuation ( path, situation ) ( b, thisBinding )
    };
  };
};
function matchUntilLeafAndThenContinue ( bc: BindingContext, condition: any, condPath: string[] ): ( continuation: OnFoundFn ) => MatchFn {
  const bcIndented = debugAndIndent ( bc, )
  if ( isPrimitive ( condition ) ) return primitiveMatchFn ( bcIndented, condition, condPath )
  if ( Array.isArray ( condition ) ) throw new Error ( `Can't handle arrays yet` )
  return objectMatchFn ( bcIndented, condition, condPath )
}

export const finalOnBound: OnFoundFn = ( b, thisBinding ) => [ ...b, thisBinding ];
export const evaluate = ( bc: BindingContext, condition: any ) => {
  const matcher = matchUntilLeafAndThenContinue ( bc, condition, [] ) ( finalOnBound );
  return ( situation: any ): Binding[] => {
    return safeArray ( matcher ( [], situation ) ( [], {} ) );
  };
};
