import { RunbookComponent } from "@runbook/utilities_react";
import { NameAnd } from "@runbook/utils";
import { getOptional, parsePath } from "@runbook/optics";

export type DisplayFn<S> = ( parentPath: string[], item: string, mode: string, obj: any | undefined ) => RunbookComponent<S, any> | undefined


export interface DisplayGroupAndItem<S> {
  __group?: RunbookComponent<S, any>
  __item?: RunbookComponent<S, any>
}
export function isDisplayGroupAndItem<S> ( x: any ): x is DisplayGroupAndItem<S> {
  return x.__group !== undefined || x.__item !== undefined
}

export interface NameAndDisplayGroupAndItem<S> extends NameAnd<DisplayGroupAndItem<S> | RunbookComponent<S, any> | NameAndDisplayGroupAndItem<S>> {

}

export function displayFnFromNameAnd<S> ( na: NameAndDisplayGroupAndItem<S>, defFn: RunbookComponent<S, any> ): DisplayFn<S> {
  return ( parentPath, item, mode, obj ): RunbookComponent<S, any> => {
    const forParentPath: DisplayGroupAndItem<S> | RunbookComponent<S, any> | undefined = getOptional ( parsePath ( parentPath ), na );
    if ( forParentPath === undefined ) return defFn
    const path = [ ...parentPath, item ]
    const forPath: DisplayGroupAndItem<S> | RunbookComponent<S, any> | undefined = getOptional ( parsePath ( path ), na );

    console.log ( 'displayFnFromNameAnd', parentPath, item )
    console.log ( 'displayFnFromNameAnd for Path', forPath )
    console.log ( 'displayFnFromNameAnd for PArentPath', forParentPath )

    if ( forPath === undefined ) {  //e.g. ['view'] 'v1'   (note that with [] 'view' we would have a forPath
      if ( isDisplayGroupAndItem<S> ( forParentPath ) && forParentPath.__item !== undefined ) return forParentPath.__item
      if ( typeof forParentPath === 'function' ) return forParentPath
    }
    //here we are in the scenario [] 'view' or ['ontology'] 'mereology'
    if ( isDisplayGroupAndItem<S> ( forPath ) ) {
      if ( forPath.__group !== undefined ) return forPath.__group
    }
    if ( typeof forPath === 'function' ) return forPath
    return defFn

  }

}