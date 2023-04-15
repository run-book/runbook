import { flatMap, isPrimitive, NameAnd, Primitive, safeArray } from "@runbook/utils";
import { InheritsFromFn } from "./inheritance";
import { FromReferenceDataFn, Mereology, NameSpaceAndValue } from "@runbook/mereology";
import { deepSortCondition } from "./condition";
import { mereology } from "./binding.fixture";


export type Binding = NameAnd<PathAndValue>

export interface PathAndValue extends NameSpaceAndValue {
  namespace?: string
  value: Primitive
  path: string[]
}
export interface BindingContext {
  inheritsFrom: InheritsFromFn
  mereology: Mereology
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
  if ( bc.debug && args.length > 0 ) debug ( this, ...args )
  return bc
}

const idAndInheritsFrom = /^\{([a-zA-Z0-9]*):?([a-zA-Z0-9]*)}$/
function parseBracketedString ( path: string[], s: string ): VarNameAndInheritsFrom {
  const matches = idAndInheritsFrom.exec ( s )
  if ( !matches ) throw new Error ( `Invalid variable at ${path} -- ${s}` )
  const varName = matches[ 1 ]
  const inheritsFrom = matches[ 2 ]
  return { varName, inheritsFrom }
}

interface VarNameAndInheritsFrom {
  varName: string
  inheritsFrom: string
}
interface MatchsPrimitive {
  varNameAndInheritsFrom?: VarNameAndInheritsFrom
  binding: Binding
}
const matchPrimitiveAndAddBindingIfNeeded = ( bc: BindingContext, condition: Primitive ) => ( binding: Binding, path: string[], situation: Primitive ): MatchsPrimitive | undefined => {
  if ( typeof condition === 'string' && condition.startsWith ( '{' ) && condition.endsWith ( '}' ) ) {
    const varNameAndInheritsFrom = parseBracketedString ( path, condition )
    const { varName, inheritsFrom } = varNameAndInheritsFrom
    if ( inheritsFrom.length > 0 ) {
      if ( typeof situation !== 'string' )
        return undefined;
      let inherits = bc.inheritsFrom ( situation, inheritsFrom );
      if ( !inherits ) return undefined;
    }
    const newBinding: Binding = { ...binding }
    newBinding[ varName ] = { path, value: situation, namespace: (inheritsFrom?.length > 0 ? inheritsFrom : undefined) }
    return { binding: newBinding, varNameAndInheritsFrom }
  }
  return condition === situation ? { binding } : undefined
};

type OnFoundFn = ( b: Binding[], thisBinding: Binding ) => Binding[]

interface MatchResult {
  bindings: Binding[]
  match: boolean
}
const checkSituationMatchesCondition = ( bc: BindingContext, condK, condV, continuation: OnFoundFn ) => ( oldPath: string[], sitV, sitK ): OnFoundFn => {
  let matchPrim = matchPrimitiveAndAddBindingIfNeeded ( bc, condK );
  return ( bindings: Binding[], thisBinding: Binding ): Binding[] => {
    if ( sitV === undefined ) return bindings;
    const path = [ ...oldPath, sitK ]
    const matchsPrimitive: MatchsPrimitive = matchPrim ( thisBinding, path, sitK )
    if ( matchsPrimitive === undefined ) return bindings
    let result = matchUntilLeafAndThenContinue ( bc, condV, continuation ) ( path, sitV, bindings, matchsPrimitive.binding );
    if ( result.length === bindings.length && matchsPrimitive.varNameAndInheritsFrom ) {//OK we didn't match in the situation. Maybe we can match in the mereology?
      const { varName, inheritsFrom } = matchsPrimitive.varNameAndInheritsFrom
      const inMere = bc.refDataFn ( Object.values ( thisBinding ), inheritsFrom, sitK )
      if ( inMere === undefined ) return bindings
      let mereologyResult = matchUntilLeafAndThenContinue ( bc, condV, continuation ) ( path, inMere, bindings, matchsPrimitive.binding )
      return mereologyResult === undefined ? bindings : mereologyResult;
    }
    return result
  };
};
const exploreSituationForAllVariableMatches = ( bc: BindingContext, condK, condV, continuation: OnFoundFn ) => {
  let matcher = checkSituationMatchesCondition ( bc, condK, condV, continuation );
  return ( oldPath: string[], situation: any ) =>
    ( bindings: Binding[], thisBinding ) => flatMap ( Object.entries ( situation ), ( [ sitK, sitV ] ) =>
      matcher ( oldPath, sitV, sitK ) ( bindings, thisBinding ) );
};
const makeOnFoundToExploreObject = ( bc: BindingContext, condition: any, onFound: OnFoundFn ) => {
  const bcIndented = debugAndIndent ( bc, 'makeOnFoundToExploreObject', JSON.stringify ( condition ) )
  const sortedCondition = deepSortCondition ( mereology, `condition ${JSON.stringify ( condition, null, 2 )}`, condition )
  return ( oldPath: string[], situation: any ): OnFoundFn => {
    const onFoundForEachEntry: (( cont: OnFoundFn ) => OnFoundFn)[] = Object.entries ( sortedCondition ).map ( ( [ condK, condV ] ) =>
      ( continuation: OnFoundFn ) => condK.startsWith ( '{' ) && condK.endsWith ( '}' )
        ? exploreSituationForAllVariableMatches ( bcIndented, condK, condV, continuation)(oldPath, situation )
        : checkSituationMatchesCondition ( bcIndented, condK, condV, continuation ) ( oldPath, situation?.[ condK ], condK ) )
    let res: OnFoundFn = onFoundForEachEntry.reduce ( ( acc, v ) => v ( acc ), onFound );
    return res
  };
};

type MatchFn = ( path: string[], situation: any, b: Binding[], thisBinding: Binding ) => Binding[] | undefined
function primitiveMatchFn ( bcIndented: BindingContext, condition: any, onFound: ( b: Binding[], thisBinding: Binding ) => Binding[] ) {
  let matcher = matchPrimitiveAndAddBindingIfNeeded ( bcIndented, condition );
  return ( path: string[], situation: any, b: Binding[], thisBinding: Binding ): Binding[] | undefined => {
    const matches = matcher ( thisBinding, path, situation )
    debug ( bcIndented, 'isPrimitive', JSON.stringify ( condition ), JSON.stringify ( situation ), JSON.stringify ( matches ) )
    return matches ? onFound ( b, matches.binding ) : [];
  }
}
function objectMatchFn ( bcIndented: BindingContext, condition: any, onFound: ( b: Binding[], thisBinding: Binding ) => Binding[] ) {
  let onFoundMaker = makeOnFoundToExploreObject ( bcIndented, condition, onFound );
  return ( path: string[], situation: any, b: Binding[], thisBinding: Binding ): Binding[] | undefined => {
    if ( Array.isArray ( situation ) ) throw new Error ( `Can't handle arrays yet` )
    let result = onFoundMaker ( path, situation ) ( b, thisBinding );
    return result
  };
}
function matchUntilLeafAndThenContinue ( bc: BindingContext, condition: any, onFound: OnFoundFn ): MatchFn {
  const bcIndented = debugAndIndent ( bc, )
  if ( isPrimitive ( condition ) ) return primitiveMatchFn ( bcIndented, condition, onFound );
  if ( Array.isArray ( condition ) ) throw new Error ( `Can't handle arrays yet` )

  //if we matched on a new object make the code that explores it. This flattens out the iteration over the entries.
  return objectMatchFn ( bcIndented, condition, onFound );
}

export const finalOnBound: OnFoundFn = ( b, thisBinding ) => [ ...b, thisBinding ];
export const evaluate = ( bc: BindingContext, condition: any ) => {
  let matcher = matchUntilLeafAndThenContinue ( bc, condition, finalOnBound );
  return ( situation: any ): Binding[] => {
    return safeArray ( matcher ( [], situation, [], {} ) );
  };
};
