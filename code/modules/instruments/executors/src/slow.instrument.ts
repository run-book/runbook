import { Executable, ExecutableOutput, ExecutionCommon, ExitCodeAndOutput } from "./executors";
import { NameAnd } from "@runbook/utils";
import { CleanInstrumentParam } from "@runbook/instruments";
import * as stream from "stream";
import { NullReadable } from "./null.stream";

export interface SlowParams {
  count: number
  delay: number
  stopAt: number
}

export function slowExecution ( p: SlowParams, stream: stream.Readable ): Promise<ExitCodeAndOutput> {
  return new Promise ( ( resolve, reject ) => {
    function delay ( i: number ) {
      // console.log ( 'delay', i, p.stopAt )
      if ( i > p.stopAt ) {
        // console.log ( 'emiting', `slow ${i}\n` )
        stream.emit ( "data", `slow ${i}\n` )
        if ( i <= 1 ) {
          // console.log ( 'finished', `i ${i}` )
          stream.destroy ()
          resolve ( { code: 0 } )
        } else
          setTimeout ( () => delay ( i - 1 ), p.delay )
      } else
        setTimeout ( () => delay ( i ), p.delay )
    }
    delay ( p.count )
  } )
}

function makeOutputForSlow ( t: SlowParams, outListener: ( s: stream.Readable ) => void, errListener: ( s: stream.Readable ) => void ): ExecutableOutput<SlowParams> {
  // @ts-ignore
  const out: stream.Readable = new NullReadable ()
  outListener ( out )
  return ({ promise: slowExecution ( t, out ), next: () => undefined });
}
export const SlowExecutor: Executable<SlowParams> = {
  name: ( t: SlowParams ): string => "SlowExecutor",
  description: ( t: SlowParams ): string => "A slow executor to allow tests and demos",
  params: ( t: SlowParams ): NameAnd<CleanInstrumentParam> =>
    ({
        count: { description: "Number of times to delay", default: "1" },
        delay: { description: "Delay in ms", default: "1000" },
        stopAt: { description: "The executor will count down to this number", default: "1000" }
      }
    ),
  execute: ( common, outListener, errListener ) =>
    makeOutputForSlow ( common.t, outListener, errListener )

}

export interface MultipleSlowParams {
  stages: number
  count: number
  delay: number
  stopAt: number
}

export const MultipleSlowExecutor: Executable<MultipleSlowParams> = {
  name: ( t: MultipleSlowParams ): string => "MultipleSlowExecutor",
  description: ( t: MultipleSlowParams ): string => `A slow executor to allow tests and demos that has ${t.stages} stages`,
  params: ( t: MultipleSlowParams ): NameAnd<CleanInstrumentParam> =>
    ({
      stages: { description: 'How many stages there are', },
      count: { description: "Number of times to delay", default: "1" },
      delay: { description: "Delay in ms", default: "1000" },
      stopAt: { description: "The executor will count down to this number" }
    }),
  execute: ( executionCommon, outListener, errListener ) => {
    // @ts-ignore
    const out: stream.Readable = new NullReadable ()
    outListener ( out )
    const next =
            ( common: ExecutionCommon<MultipleSlowParams>,
              outListener: ( s: stream.Readable ) => void,
              errListener: ( s: stream.Readable ) => void ): ExecutableOutput<MultipleSlowParams> | undefined => {
              // console.log ( "in next", common.t, 'stage', common.stage, 'out', common.out )
              // common.t.stopAt = common.t.count //reset
              if ( common.stage < common.t.stages ) {
                return ({ promise: slowExecution ( executionCommon.t, out ), next });
              } else {
                // console.log ( 'returning undefined for next' )
                return undefined
              }

            }
    return ({ promise: slowExecution ( executionCommon.t, out ), next });

  }

}
