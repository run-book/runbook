import { mapObjValues, NameAnd, Primitive } from "@runbook/utils";
import { CleanInstrumentParam } from "@runbook/instruments";
import * as stream from "stream";

export type Params = NameAnd<Primitive>

export interface ExecutionCommon<T> {
  executorId: string;
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
}
export interface Execution<T> extends ExecutionCommon<T> {
  promise: Promise<ExecutionResult<T>>
}

export interface ExecutableOutput {
  out?: stream.Readable
  err?: stream.Readable
  promise: Promise<number>
  // next: () => ExecutableOutput|undefined
}
export interface Executable<T> {
  name: ( t: T ) => string,
  description: ( t: T ) => string,
  params: ( t: T ) => string | NameAnd<CleanInstrumentParam>,
  execute: ( t: T ) => ( params: NameAnd<Primitive> ) => ExecutableOutput
}

export interface Executor {
  date: () => number
  nextId: () => string
  active: NameAnd<Execution<any>>
}

function listenTo ( out: stream.Readable | undefined, param2: ( s ) => any ) {
  if ( out ) out.on ( 'data', param2 )
}
export const execute = ( e: Executor ) => <T> ( executable: Executable<T>, timeout: number ) => ( t: T, params: any ) => {
  const executionOutput: ExecutableOutput = executable.execute ( t ) ( params )
  const id = e.nextId ()

  const common: ExecutionCommon<T> = {
    executorId: id, startTime: e.date (), timeout, t, executable, params, out: '', err: '', finished: false
  }
  listenTo ( executionOutput.out, s => {
    console.log ( 'out', s )
    return common.out += s;
  } )
  listenTo ( executionOutput.err, s => common.err += s )
  common[ 'promise' ] = executionOutput.promise.then ( code => {
    common.finished = true
    return ({ ...common, code, });
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