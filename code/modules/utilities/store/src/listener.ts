import { checkStore, isFullStore, Store } from "./store";

export interface StoreListener<State> {
  updated?: ( state: State ) => Promise<void>
  error?: ( state: State, error: any, source: any ) => Promise<void>
}
export const emptyStoreListener: StoreListener<any> = {
  updated: async () => { },
  error: async () => { }
}
export function addListener<State> ( store: Store<State>, listener: StoreListener<State> ): void {
  if ( !isFullStore ( store ) ) throw new Error ( 'Store not initialised' )
  store.listeners.push ( listener )
}

export async function notifyListeners<State> ( store: Store<State>, fn: ( l: StoreListener<State>, state: State ) => Promise<void> | undefined ): Promise<void> {
  let fullStore = checkStore ( store );
  await Promise.all ( fullStore.listeners.map ( listener => fn ( listener, fullStore.state ) ) )
}

export async function notifyUpdateListeners<State> ( store: Store<State> ): Promise<void> {
  return notifyListeners ( store, ( listener, state ) => listener?.updated?. ( state ) )
}
export async function notifyErrorListeners<State> ( store: Store<State>, error: any, source?: any ): Promise<void> {
  try {
    await notifyListeners ( store, ( listener, state ) => listener?.error?. ( state, error, source ) )
  } catch ( e ) {
    console.error ( 'Error notifying error listeners', e )
  }
}