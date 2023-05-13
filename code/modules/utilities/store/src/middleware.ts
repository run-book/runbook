import { getOptional, Optional, setOptional, TransformCmd } from "@runbook/optics";
import { addCmd, checkStore, Store } from "./store";
import { notifyErrorListeners } from "./listener";

export interface Middleware<S, Command> {
  optional: Optional<S, Command[]>
  process: ( c: Command[], onError: ( c: Command, e: any ) => Promise<void> ) => Promise<TransformCmd<S, any>[]>
}

export const applyMiddleware = <S, Command> ( store: Store<S>, onError: ( c: Command, e: any ) => Promise<void> ) => ( s: S, m: Middleware<S, Command> ): S => {
  const commands = getOptional ( m.optional, s )
  if ( commands === undefined || commands.length === 0 ) return s
  const newState = setOptional ( m.optional, s, [] )
  if ( newState === undefined ) throw new Error ( 'newState is undefined. This should not happen' )
  m.process ( commands, onError )
    .then ( transforms => transforms.forEach ( addCmd ( store ) ) )
  return newState
};