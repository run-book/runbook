import { flatMap, NameAnd } from "@runbook/utils";
import { StringDag } from "./inheritance";


export type Binding = NameAnd<PathAndValue>

export interface PathAndValue {
  path: string[]
  value: Primitive
}
export interface BindingContext {
  inheritance: StringDag
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

type Primitive = string | number | boolean | null | undefined;
function isPrimitive ( a: any ): a is Primitive {
  const t = typeof a
  return a === null || a == undefined || t === 'string' || t === 'number' || t === 'boolean'
}

function keyMatches ( sitK: string, condK: string ) {
  return condK.startsWith ( '{' ) && condK.endsWith ( '}' ) || sitK === condK;
}

const idAndInheritsFrom = /^\{([a-zA-Z0-9]*):?([a-zA-Z0-9]*)}$/
function parseBracketedString ( path: string[], s: string ) {
  const matches = idAndInheritsFrom.exec ( s )
  if ( !matches ) throw new Error ( `Invalid variable at ${path} -- ${s}` )
  const varName = matches[ 1 ]
  const inheritsFrom = matches[ 2 ]
  return { varName, inheritsFrom }
}
function matchPrimitiveAndAddBindingIfNeeded ( bc: BindingContext, b: Binding, path: string[], condition: Primitive, situation: Primitive ): Binding | undefined {
  if ( typeof condition === 'string' && condition.startsWith ( '{' ) && condition.endsWith ( '}' ) ) {
    const { varName, inheritsFrom } = parseBracketedString ( path, condition )
    if ( inheritsFrom.length > 0 ) {
      if ( typeof situation !== 'string' )
        return undefined;
      let inherits = bc.inheritance.parents[ situation ]?.includes ( inheritsFrom );
      if ( !inherits ) return undefined;
    }
    const newBinding: Binding = { ...b }
    newBinding[ varName ] = { path, value: situation }
    return newBinding
  }
  return condition === situation ? b : undefined
}

type OnFoundFn = ( b: Binding[], thisBinding: Binding ) => Binding[]

function makeOnFoundToExploreObject ( bc: BindingContext, oldPath: string[], condition: any, situation: any, onFound: OnFoundFn ): OnFoundFn {
  const bcIndented = debugAndIndent ( bc, 'makeOnFoundToExploreObject', JSON.stringify ( condition ) )
  let condKVs = Object.entries ( condition );
  // if ( condKVs.length === 0 ) return ( b, t ) => onFound ( [ ...b, t ], {} );
  let listOfFunctionsForEachPath = condKVs.map ( ( [ condK, condV ] ) => {
    //TODO when tests pass optimse for 'i know the binding' aka 'prod' instead of '{prod}'
    let contFn = ( continuation: OnFoundFn ) =>
      ( bindings: Binding[], thisBinding ) => flatMap ( Object.entries ( situation ), ( [ sitK, sitV ] ) => {
        const path = [ ...oldPath, sitK ]
        const newBinding: Binding = matchPrimitiveAndAddBindingIfNeeded ( bc, thisBinding, path, condK, sitK )
        if ( newBinding === undefined ) return bindings
        let result = matchUntilLeafAndThenContinue ( bcIndented, path, condV, sitV, bindings, newBinding, continuation );
        if ( result === undefined ) return bindings
        return result;
      } );
    return contFn
  } );
  const onFoundForEachEntry: (( cont: OnFoundFn ) => OnFoundFn)[] = listOfFunctionsForEachPath
  let res = onFoundForEachEntry.reduce ( ( acc, v ) => v ( acc ), onFound );
  return res
}
function matchUntilLeafAndThenContinue ( bc: BindingContext, path: string[], condition: any, situation: any, b: Binding[], thisBinding: Binding, onFound: OnFoundFn ): Binding[] | undefined {
  const bcIndented = debugAndIndent ( bc, )
  if ( b === undefined ) return undefined
  if ( isPrimitive ( condition ) ) {
    const newBinding = matchPrimitiveAndAddBindingIfNeeded ( bcIndented, thisBinding, path, condition, situation )
    debug ( bcIndented, 'isPrimitive', JSON.stringify ( condition ), JSON.stringify ( situation ), JSON.stringify ( newBinding ) )
    if ( newBinding ) {
      let allBindings = [ ...b, newBinding ];
      const x = (onFound as any).description;
      let res = onFound ( b, newBinding );

      return res;
    } else {
      return [];
    }
  }

  if ( Array.isArray ( condition ) || Array.isArray ( situation ) ) throw new Error ( `Can't handle arrays yet` )
  //if we matched on a new object make the code that explores it. This flattens out the iteration over the entries.

  const newOnFound = makeOnFoundToExploreObject ( bcIndented, path, condition, situation, onFound )
  return newOnFound ( b, thisBinding )
}

export const finalOnBound: OnFoundFn = ( b, thisBinding ) => [ ...b, thisBinding ];
export function eval2 ( bc: BindingContext, condition: any, situation: any ): Binding[] {
  return matchUntilLeafAndThenContinue ( bc, [], condition, situation, [], {}, finalOnBound )
}
