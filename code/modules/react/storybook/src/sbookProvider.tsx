import { Optional } from "@runbook/optics";
import { display, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { addCmd, addListener, checkStore, emptyStoreListener, newStore, removeListener, Store, StoreListener } from "@runbook/store";
import { useState, useSyncExternalStore } from "react";


export interface SBookProps<S, C> {
  s: S,
  id?: string,
  opt: Optional<S, NonNullable<C>>,
  children: RunbookComponent<S, C>
  mode: string | undefined
}

//Wrong signature.
export const subscribe = <S extends any> ( store: Store<S> ) => ( callback: ( s: S ) => void ): () => void => {
  console.log ( 'subscribe', store, callback )
  const listener: StoreListener<S> = {
    ...emptyStoreListener,
    updated: async s => {
      console.log('subscribe - updated', s)
      callback ( s ); }
  }
  addListener ( store, listener )
  console.log ( 'at end of subscribe', store, callback )
  const unsubscribe = () => removeListener ( store, listener )
  return unsubscribe
};
export const getSnapshot = <S extends any> ( store: Store<S> ) => (): S => checkStore ( store ).state;

export function DisplayStoryBook<S, C> ( props: SBookProps<S, C> ) {
  const { s, id, opt, children, mode } = props
  console.log ( `display storybook: ${id} ${mode}`, s )
  const [ state, setState ] = useState ( s )
  const st = new RunbookState<S, NonNullable<C>> ( state, opt, setState )
  return <div>
    {display ( st, props, children )}
    <hr/>
    <h3>State</h3>
    <pre>{JSON.stringify ( st.state, null, 2 )}</pre>
  </div>

}

