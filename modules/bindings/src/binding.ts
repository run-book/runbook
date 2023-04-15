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
function matchPrimitiveAndAddBindingIfNeeded ( bc: BindingContext, binding: Binding, path: string[], condition: Primitive, situation: Primitive ): MatchsPrimitive | undefined {
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
}

type OnFoundFn = ( b: Binding[], thisBinding: Binding ) => Binding[]

interface MatchResult {
  bindings: Binding[]
  match: boolean
}
function checkSituationMatchesCondition ( oldPath: string[], sitK, bc: BindingContext, condK, condV, sitV, continuation: OnFoundFn ): OnFoundFn {
  return ( bindings: Binding[], thisBinding: Binding ): Binding[] => {
    if ( sitV === undefined ) return bindings;
    const path = [ ...oldPath, sitK ]
    const matchsPrimitive: MatchsPrimitive = matchPrimitiveAndAddBindingIfNeeded ( bc, thisBinding, path, condK, sitK )
    if ( matchsPrimitive === undefined ) return bindings
    let result = matchUntilLeafAndThenContinue ( bc, path, condV, sitV, bindings, matchsPrimitive.binding, continuation );
    if ( result.length === bindings.length && matchsPrimitive.varNameAndInheritsFrom ) {//OK we didn't match in the situation. Maybe we can match in the mereology?
      const { varName, inheritsFrom } = matchsPrimitive.varNameAndInheritsFrom
      const inMere = bc.refDataFn ( Object.values ( thisBinding ), inheritsFrom, sitK )
      if ( inMere === undefined ) return bindings
      let mereologyResult = matchUntilLeafAndThenContinue ( bc, path, condV, inMere, bindings, matchsPrimitive.binding, continuation )
      return mereologyResult === undefined ? bindings : mereologyResult;
    }
    return result
  }
}
function exploreSituationForAllVariableMatches ( bc: BindingContext, oldPath: string[], situation: any, condK, condV, continuation: ( b: Binding[], thisBinding: Binding ) => Binding[] ) {
  return ( bindings: Binding[], thisBinding ) => flatMap ( Object.entries ( situation ), ( [ sitK, sitV ] ) =>
    checkSituationMatchesCondition ( oldPath, sitK, bc, condK, condV, sitV, continuation ) ( bindings, thisBinding ) );
}
function makeOnFoundToExploreObject ( bc: BindingContext, oldPath: string[], condition: any, situation: any, onFound: OnFoundFn ): OnFoundFn {
  const bcIndented = debugAndIndent ( bc, 'makeOnFoundToExploreObject', JSON.stringify ( condition ) )
  const sortedCondition = deepSortCondition ( mereology, `condition ${JSON.stringify ( condition, null, 2 )}`, condition )
  const onFoundForEachEntry: (( cont: OnFoundFn ) => OnFoundFn)[] = Object.entries ( sortedCondition ).map ( ( [ condK, condV ] ) =>
    ( continuation: OnFoundFn ) => condK.startsWith ( '{' ) && condK.endsWith ( '}' )
      ? exploreSituationForAllVariableMatches ( bcIndented, oldPath, situation, condK, condV, continuation )
      : checkSituationMatchesCondition ( oldPath, condK, bcIndented, condK, condV, situation?.[ condK ], continuation ) )
  let res: OnFoundFn = onFoundForEachEntry.reduce ( ( acc, v ) => v ( acc ), onFound );
  return res
}


function matchUntilLeafAndThenContinue ( bc: BindingContext, path: string[], condition: any, situation: any, b: Binding[], thisBinding: Binding, onFound: OnFoundFn ): Binding[] | undefined {
  const bcIndented = debugAndIndent ( bc, )
  if ( isPrimitive ( condition ) ) {
    const matches = matchPrimitiveAndAddBindingIfNeeded ( bcIndented, thisBinding, path, condition, situation )
    debug ( bcIndented, 'isPrimitive', JSON.stringify ( condition ), JSON.stringify ( situation ), JSON.stringify ( matches ) )
    return matches ? onFound ( b, matches.binding ) : [];
  }

  if ( Array.isArray ( condition ) || Array.isArray ( situation ) ) throw new Error ( `Can't handle arrays yet` )

  //if we matched on a new object make the code that explores it. This flattens out the iteration over the entries.
  const newOnFound = makeOnFoundToExploreObject ( bcIndented, path, condition, situation, onFound )
  let result = newOnFound ( b, thisBinding );
  return result
}

export const finalOnBound: OnFoundFn = ( b, thisBinding ) => [ ...b, thisBinding ];
export function evaluate ( bc: BindingContext, condition: any, situation: any ): Binding[] {
  return safeArray ( matchUntilLeafAndThenContinue ( bc, [], condition, situation, [], {}, finalOnBound ) )
}