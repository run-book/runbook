import { RunbookComponent } from "@runbook/utilities_react";
import { NameAnd } from "@runbook/utils";
import { getOptional, parsePath } from "@runbook/optics";

export type DisplayFn = <C>( parentPath: string[], item: string, obj: C | undefined ) => RunbookComponent<any> | undefined


export interface DisplayGroupAndItem<C> {
  __group?: RunbookComponent<NameAnd<C>>
  __item?: RunbookComponent<C>
}
export function isDisplayGroupAndItem<C> ( x: any ): x is DisplayGroupAndItem<C> {
  return x.__group !== undefined || x.__item !== undefined
}

export interface NameAndDisplayGroupAndItem extends NameAnd<DisplayGroupAndItem<any> | RunbookComponent<any> | NameAndDisplayGroupAndItem> {

}

export function displayFnFromNameAnd ( na: NameAndDisplayGroupAndItem, defFn: RunbookComponent<any> ): DisplayFn {
  return ( parentPath, item, obj ) => {
    const forParentPath: DisplayGroupAndItem<any> | RunbookComponent<any> | undefined = getOptional ( parsePath ( parentPath ), na );
    if ( forParentPath === undefined ) return defFn
    const path = [ ...parentPath, item ]
    const forPath: DisplayGroupAndItem<any> | RunbookComponent<any> | undefined = getOptional ( parsePath ( path ), na );

    console.log ( 'displayFnFromNameAnd', parentPath, item )
    console.log ( 'displayFnFromNameAnd for Path', forPath )
    console.log ( 'displayFnFromNameAnd for PArentPath', forParentPath )

    if ( forPath === undefined ) {  //e.g. ['view'] 'v1'   (note that with [] 'view' we would have a forPath
      if ( isDisplayGroupAndItem ( forParentPath ) && forParentPath.__item !== undefined ) return forParentPath.__item
      if ( typeof forParentPath === 'function' ) return forParentPath
    }
    //here we are in the scenario [] 'view' or ['ontology'] 'mereology'
    if ( isDisplayGroupAndItem ( forPath )) {
      if ( forPath.__group !== undefined ) return forPath.__group
      if ( forPath.__item !== undefined ) return forPath.__item
    }
    if ( typeof forPath === 'function' ) return forPath
    return defFn
  }

}