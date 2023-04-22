import { RunbookComponent } from "@runbook/runbook_state";
import { NameAnd } from "@runbook/utils";
import { getOptional, parsePath } from "@runbook/optics";

export type DisplayFn<S> = ( parentPath: string[], item: string, mode: string, obj: any | undefined ) => RunbookComponent<S, any> | undefined


export interface DisplayComponent<S> extends NameAnd<RunbookComponent<S, any> | DisplayComponent<S>> {

}

/** See samples for usage
 *
 * This is basically a 'compose the whole display' function
 *
 * The keys match the situation unless the are a __ prefix
 * __item is the default component used for the item
 * __<mode> overrides item for a specific mode
 * __group is used when we are displaying an overview
 *  */
export function displayFnFromNameAnd<S> ( na: DisplayComponent<S>, defFn: RunbookComponent<S, any> ): DisplayFn<S> {
  return ( parentPath, item, mode, obj ): RunbookComponent<S, any> => {
    const forParentPath: DisplayComponent<S> | RunbookComponent<S, any> | undefined = getOptional ( parsePath ( parentPath ), na );
    if ( forParentPath === undefined ) return defFn
    const path = [ ...parentPath, item ]
    const forPath: DisplayComponent<S> | RunbookComponent<S, any> | undefined = getOptional ( parsePath ( path ), na );

    console.log ( 'displayFnFromNameAnd', parentPath, item )
    console.log ( 'displayFnFromNameAnd mode', mode )
    console.log ( 'displayFnFromNameAnd for Path', forPath )
    console.log ( 'displayFnFromNameAnd for PArentPath', forParentPath )

    if ( forPath === undefined ) {  //e.g. ['view'] 'v1'   (note that with [] 'view' we would have a forPath
      if ( typeof forParentPath === 'object' ) {
        const key = '__' + mode
        let keyedItem = forParentPath[ key ];
        console.log('keyedItem', key, keyedItem)
        if ( typeof keyedItem === 'function' ) return keyedItem
        if ( typeof forParentPath.__item === 'function' ) return forParentPath.__item
      }
      if ( typeof forParentPath === 'function' ) return forParentPath
    }
    //here we are in the scenario [] 'view' or ['ontology'] 'mereology'
    if ( typeof forPath === 'object' ) {
      if ( typeof forPath.__group === 'function' ) return forPath.__group
    }
    if ( typeof forPath === 'function' ) return forPath
    return defFn

  }

}