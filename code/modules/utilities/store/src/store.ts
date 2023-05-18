import { TransformCmd } from "@runbook/optics";
import { StoreListener } from "./listener";
import { Middleware } from "./middleware";

const debug = require ( 'debug' ) ( 'store' )

export interface Store<State> {
}
export interface FullStore<State> extends Store<State> {
  wait: number
  stop?: boolean
  queue: TransformCmd<State, any>[]
  state: State
  listeners: StoreListener<State>[]
  middleWare: Middleware<State>[]
}
export function isFullStore<State> ( store: Store<State> ): store is FullStore<State> {
  return (store as FullStore<State>).state !== undefined
}
export function checkStore<State> ( store: Store<State> ): FullStore<State> {
  if ( !isFullStore ( store ) ) throw new Error ( 'Store not initialised' )
  return store
}
export function newStore<State> ( state: State, wait: number = 50, ...middleWare: Middleware<State>[] ): Store<State> {
  debug ( 'newStore -state', JSON.stringify ( state ) )
  debug ( 'newStore -wait and middleware', wait, JSON.stringify ( middleWare ) )
  return { state, listeners: [], queue: [], wait, middleWare }
}

export const addCmd = <State> ( store: Store<State> ) => ( cmd: TransformCmd<State, any> ): void => {
  debug ( 'addCmd', JSON.stringify ( cmd ) )
  checkStore ( store ).queue.push ( cmd )
  //Note that these will get picked up at the next 'processNext' in the full store
};

