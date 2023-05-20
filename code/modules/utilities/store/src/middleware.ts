import { getOptional, Optional, setOptional, TransformCmd, transformToString } from "@runbook/optics";
import { addCmd, Store } from "./store";

export type Middleware<S> = CommandMiddleware<S, any> | SimpleMiddleware<S>

export interface SimpleMiddleware<S> {
  process: ( s: S, cmds: TransformCmd<S, any>[], onError: ( c: any, e: any ) => Promise<void> ) => Promise<TransformCmd<S, any>[]>
}
export function isSimpleMiddleware<S> ( m: Middleware<S> ): m is SimpleMiddleware<S> {
  return m !== undefined && (m as any).optional === undefined && m.process !== undefined
}
function applySimpleMiddleware<S> ( m: SimpleMiddleware<S>, cmds: TransformCmd<S, any>[], s: S, onError: ( c: S, e: any ) => Promise<void>, store: Store<S> ): S {
  m.process ( s, cmds, onError ).then ( transforms => {
    console.log ( 'applySimpleMiddleware - transforms', transforms.map ( transformToString ) )
    transforms.forEach ( addCmd ( store ) );
    console.log ( 'applySimpleMiddleware - store at end', store )
  } )
  return s
}

export interface CommandMiddleware<S, Command> {
  optional: Optional<S, Command[]>
  process: ( c: Command[], onError: ( c: Command, e: any ) => Promise<void> ) => Promise<TransformCmd<S, any>[]>
}
export function isCommandMiddleware<S, Command> ( m: Middleware<S> ): m is CommandMiddleware<S, Command> {
  return m !== undefined && (m as CommandMiddleware<S, Command>).optional !== undefined && m.process !== undefined
}


function applyCommandMiddleware<S, Command> ( m: CommandMiddleware<S, Command>, s: S, onError: ( c: Command, e: any ) => Promise<void>, store: Store<S> ) {
  const commands = getOptional ( m.optional, s )
  if ( commands === undefined || commands.length === 0 ) return s
  const newState = setOptional ( m.optional, s, [] )
  if ( newState === undefined ) throw new Error ( 'newState is undefined. This should not happen' )
  m.process ( commands, onError ).then ( transforms => transforms.forEach ( addCmd ( store ) ) )
  return newState
}
export const applyMiddleware = <S> ( store: Store<S>, cmds: TransformCmd<S, any>[], onError: ( c: any, e: any ) => Promise<void> ) => ( s: S, m: Middleware<S> ): S => {
  console.log ( 'applyMiddleware', m )
  if ( isCommandMiddleware ( m ) ) return applyCommandMiddleware ( m, s, onError, store );
  if ( isSimpleMiddleware ( m ) ) return applySimpleMiddleware ( m, cmds, s, onError, store )
  throw new Error ( `Middleware is neither a CommandMiddleware nor a SimpleMiddleware${JSON.stringify ( m, null, 2 )}` )
};