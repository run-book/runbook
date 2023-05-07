import { Executable, ExecutableOutput } from "./executors";
import { NameAnd, Primitive } from "@runbook/utils";
import { CleanInstrumentParam } from "@runbook/instruments";
import * as stream from "stream";
import { NullReadable, NullWritable } from "./null.stream";

export interface SlowParams {
  count: number
  delay: number
  stopAt: number
}

export function slowExecution ( p: SlowParams, stream: stream.Readable ): Promise<number> {
  return new Promise ( ( resolve, reject ) => {
    function delay ( i: number ) {
      console.log ( 'delay', i, p.stopAt )
      if ( i > p.stopAt ) {
        console.log ( 'emiting', `slow ${i}\n` )
        stream.emit ( "data", `slow ${i}\n` )
        if ( i <= 1 ) {
          stream.destroy ()
          resolve ( 0 )
        } else setTimeout ( () => delay ( i - 1 ), p.delay )
      } else
        setTimeout ( () => delay ( i ), p.delay )
    }
    delay ( p.count )
  } )
}

export const SlowExecutor: Executable<SlowParams> = {
  name: ( t: SlowParams ): string => "SlowExecutor",
  description: ( t: SlowParams ): string => "A slow executor to allow tests and demos",
  params: ( t: SlowParams ): NameAnd<CleanInstrumentParam> =>
    ({ count: { description: "Number of times to delay", default: "1" }, delay: { description: "Delay in ms", default: "1000" } }),
  execute: ( t: SlowParams ) => ( params: NameAnd<Primitive> ): ExecutableOutput => {
    // @ts-ignore
    const out: stream.Readable = new NullReadable ()
    return ({ out, err: undefined, promise: slowExecution ( t, out ) });
  },

}