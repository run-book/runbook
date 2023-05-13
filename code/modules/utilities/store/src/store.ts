import { TransformCmd } from "@runbook/optics";
import { StoreListener } from "./listener";
import { Middleware } from "./middleware";


/** Bit of an experiment.
 *
 * We know that we need a store... the flux pattern doesn't work well when we have async actions.
 * I'm having the 'only changes you can do' be 'add cmds to the queue'.
 *
 * Then we process all the commands in the queue before notifying the listeners (reduces the event storm)
 *
 * Those listeners can trigger fetchs for example or anything else include async mutates, but the state won't change until the next 'process cmds'
 * So we are effectively batching up the cmds
 *
 */

export interface Store<State> {
}
export interface FullStore<State> extends Store<State> {
  wait: number
  stop?: boolean
  queue: TransformCmd<State, any>[]
  state: State
  listeners: StoreListener<State>[]
  middleWare: Middleware<State, any>[]
}
export function isFullStore<State> ( store: Store<State> ): store is FullStore<State> {
  return (store as FullStore<State>).state !== undefined
}
export function checkStore<State> ( store: Store<State> ): FullStore<State> {
  if ( !isFullStore ( store ) ) throw new Error ( 'Store not initialised' )
  return store
}
export function newStore<State> ( state: State, wait: number = 50, ...middleWare: Middleware<State, any>[] ): Store<State> {
  return { state, listeners: [], queue: [], wait, middleWare }
}

export const addCmd = <State> ( store: Store<State> ) => ( cmd: TransformCmd<State, any> ): void => {
  checkStore ( store ).queue.push ( cmd )
  //Note that these will get picked up at the next 'processNext' in the full store
};

