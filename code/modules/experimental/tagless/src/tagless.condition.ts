//https://www.okmij.org/ftp/tagless-final/course/lecture.pdf

import { isPrimitive } from "@runbook/utils";
import { BindingContext, deepSortCondition } from "@runbook/bindings";


export interface NameSpaceAndName {
  nameSpace: string
  name: string
}

export interface ConditionI<Acc> {
  primitiveConstant: ( acc: Acc, cond: any, condPath: string[] ) => Acc
  primitiveVariable: ( acc: Acc, nameAndNameSpace: NameSpaceAndName, condPath: string[] ) => Acc
  object: ( acc: Acc, cond: any, condPath: string[] ) => Acc
}

export const displayInterpreter: ConditionI<string[]> = {
  primitiveConstant: ( acc: string[], cond, condPath ): string[] =>
    [ ...acc, `constant [${condPath.join ( '.' )}] = ${cond}` ],
  primitiveVariable: ( acc: string[], nameAndNameSpace, condPath ): string[] =>
    [ ...acc, `variable [${condPath.join ( '.' )}] = ${nameAndNameSpace.nameSpace}:${nameAndNameSpace.name}` ],
  object: ( acc: string[], cond, condPath ): string[] =>
    [ ...acc, `object [${condPath.join ( '.' )}]` ]
}


const idAndInheritsFrom = /^\{([a-zA-Z0-9]*):?([a-zA-Z0-9]*)}$/
function parseNameAndNameSpace ( path: string[], s: string ): NameSpaceAndName {
  const matches = idAndInheritsFrom.exec ( s )
  if ( !matches ) throw new Error ( `Invalid variable at ${path} -- ${s}` )
  const varName = matches[ 1 ]
  const inheritsFrom = matches[ 2 ]
  return { name: varName, nameSpace: inheritsFrom }
}

function interpretPrimitive<Acc> ( bc: BindingContext, interpreter: ConditionI<Acc>, condPath: string[], acc: Acc, cond: any ): Acc {
  if ( typeof cond === 'string' && cond.startsWith ( '{' ) && cond.endsWith ( '}' ) )
    return interpreter.primitiveVariable ( acc, parseNameAndNameSpace ( condPath, cond ), condPath )
  else
    return interpreter.primitiveConstant ( acc, cond, condPath )
}
function interpretKeyValue<Acc> ( bc: BindingContext, interpreter: ConditionI<Acc>, acc: Acc, key: string, value: any, condPath: (string | any)[] ): Acc {
  const newCondPath = [ ...condPath, key ]
  let fromKey = interpretPrimitive ( bc, interpreter, newCondPath, acc, key );
  return interpretCondition ( bc, interpreter, value, newCondPath, fromKey )
}

function interpretObject<Acc> ( bc: BindingContext, interpreter: ConditionI<Acc>, condPath: string[], acc: Acc, cond: any ): Acc {
  const sortedCondition = deepSortCondition ( bc.mereology, `condition ${JSON.stringify ( cond, null, 2 )}`, cond )
  const afterObject = interpreter.object ( acc, sortedCondition, condPath )
  return Object.entries ( sortedCondition ).reduce ( ( acc, [ key, value ] ) =>
    interpretKeyValue ( bc, interpreter, acc, key, value, condPath ), afterObject )

}
export function interpretCondition<Acc> ( bc: BindingContext, interpreter: ConditionI<Acc>, cond: any, condPath: string[], acc: Acc ): Acc {
  if ( isPrimitive ( cond ) ) return interpreter.primitiveConstant ( acc, cond, condPath )
  if ( Array.isArray ( cond ) ) throw new Error ( `Can't handle arrays yet` )
  return interpretObject ( bc, interpreter, condPath, acc, cond )
}

