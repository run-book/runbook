import { mapObjValues, NameAnd, Primitive } from "@runbook/utils";
import { CleanInstrumentParam } from "@runbook/instruments";
import * as stream from "stream";

export type Params = NameAnd<Primitive>

export interface ExecutionCommon<T> {
  executorId: string;
  stage: number;
  startTime: number;
  timeout: number;
  executable: Executable<T>
  t: T;
  finished: boolean
  params: Params
  out: string
  err: string
}
export interface ExecutionResult<T> extends ExecutionCommon<T> {
  code: number
  output: any
}
export interface Execution<T> extends ExecutionCommon<T> {
  promise: Promise<ExecutionResult<T>>
}

export type ExecutableNextFn<T> = ( executionCommon: ExecutionCommon<T>,
                                    outListener: ( s: stream.Readable ) => void,
                                    errListener: ( s: stream.Readable ) => void ) => ExecutableOutput<T> | undefined

export interface ExitCodeAndOutput {
  code: number
}
export interface ExecutableOutput<T> {
  // out?: stream.Readable
  // err?: stream.Readable
  promise: Promise<ExitCodeAndOutput>
  next: ExecutableNextFn<T>
}

export type ExecuteFn<T> = ( executionCommon: ExecutionCommon<T>,
                             outListener: ( s: stream.Readable ) => void,
                             errListener: ( s: stream.Readable ) => void ) => ExecutableOutput<T>
export interface Executable<T> {
  name: ( t: T ) => string,
  description: ( t: T ) => string,
  params: ( t: T ) => string | NameAnd<CleanInstrumentParam>,
  execute: ExecuteFn<T>
}

export interface Executor {
  date: () => number
  nextId: () => string
  active: NameAnd<Execution<any>>
}

export function makeExecutor (): Executor {
  let id = 0
  return { date: () => Date.now (), nextId: () => "id" + id++, active: {} }
}

const listenTo = ( listener: ( s ) => any ) => ( out: stream.Readable | undefined ) => {
  if ( out ) out.on ( 'data', listener )
}

function getOnfulfilled<T> ( common: ExecutionCommon<T>, output0: ExecutableOutput<T>, resolve: ( e: ExitCodeAndOutput ) => void ) {
  return ( { code } ) => {
    // console.log ( 'in getOnfulfilled', code )
    if ( code === 0 ) {
      common.stage = common.stage + 1
      const next = output0.next ( common, listenTo ( s => common.out += s ), listenTo ( s => common.err += s ) )
      if ( next ) {
        next.promise.then ( getOnfulfilled ( common, output0, resolve ) )
      } else {
        // console.log ( 'next returned undefined, so finishing execution' )
        common.finished = true
        resolve ( { ...common, code } )
      }
    } else {
      common.finished = true
      resolve ( { ...common, code } )
    }
  };
}
export const execute = ( e: Executor ) => <T> ( executable: Executable<T>, timeout: number, t: T, params: any ) => {
  const id = e.nextId ()
  const common: ExecutionCommon<T> = { executorId: id, startTime: e.date (), timeout, t, executable, params, out: '', err: '', finished: false, stage: 0 }

  const output0: ExecutableOutput<T> = executable.execute ( common, listenTo ( s => common.out += s ), listenTo ( s => common.err += s ) );
  common[ 'promise' ] = new Promise ( ( resolve, reject ) => {
    output0.promise.then ( getOnfulfilled ( common, output0, resolve ) )
  } )
  const execution: Execution<T> = common as Execution<T>
  e.active[ id ] = execution
  return execution
};

export function executorStatus ( executor: Executor ) {
  const now = executor.date ()
  return mapObjValues ( executor.active, ( execution: Execution<any> ) => {
    const { executable, t, params, startTime, out, err, finished } = execution
    return { name: executable.name ( t ), params, time: (now - startTime) / 1000, out: out.length, err: err.length, finished }
  } );
}