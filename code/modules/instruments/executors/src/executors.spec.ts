import { execute, Execution, Executor, executorStatus } from "./executors";
import { MultipleSlowExecutor, MultipleSlowParams, SlowExecutor, SlowParams } from "./slow.instrument";

function setup (): Executor {
  let id = 0
  let date = 10000
  return { date: () => date++, nextId: () => "id" + id++, active: {} }
}

describe ( "slowInstrument", () => {
  it ( "should execute and finish and have the correct output", ( done ) => {
    const executor = setup ()
    let slow: SlowParams = { count: 2, delay: 10, stopAt: 2 };
    const execution: Execution<SlowParams> = execute ( executor ) ( SlowExecutor, 1000, slow, slow )
    expect ( execution.params ).toEqual ( slow )
    expect ( execution.executorId ).toEqual ( 'id0' )
    expect ( execution.startTime ).toEqual ( 10000 )
    expect ( execution.out ).toEqual ( '' )
    expect ( execution.err ).toEqual ( '' )
    expect ( execution.finished ).toEqual ( false )
    expect ( execution.promise ).toBeDefined ()
    expect ( Object.keys ( executor.active ) ).toEqual ( [ 'id0' ] )
    slow.stopAt = 1
    setTimeout ( () => {
      expect ( execution.out ).toEqual ( 'slow 2\n' )
      slow.stopAt = 0
      execution.promise.then ( result => {
        expect ( result.code ).toEqual ( 0 )
        expect ( result.out ).toEqual ( 'slow 2\nslow 1\n' )
        expect ( result.err ).toEqual ( '' )
        expect ( execution.finished ).toEqual ( true )
        done ()
      } )
    }, 20 )
  } )
} )
describe ( "multipleSlowInstrument", () => {
  it ( "should execute and finish and have the correct output", ( done ) => {
    const executor = setup ()
    let slow: MultipleSlowParams = { count: 2, delay: 10, stopAt: 2, stages: 3 };
    const execution = execute ( executor ) ( MultipleSlowExecutor, 1000, slow, slow )
    expect ( execution.params ).toEqual ( slow )
    expect ( execution.executorId ).toEqual ( 'id0' )
    expect ( execution.startTime ).toEqual ( 10000 )
    expect ( execution.out ).toEqual ( '' )
    expect ( execution.err ).toEqual ( '' )
    expect ( execution.finished ).toEqual ( false )
    expect ( execution.promise ).toBeDefined ()
    expect ( Object.keys ( executor.active ) ).toEqual ( [ 'id0' ] )
    slow.stopAt = 0
    // console.log('slow.stopAt', slow.stopAt)
    setTimeout ( () => {
      // console.log('slow.stopAt', slow.stopAt)
      execution.promise.then ( result => {
        expect ( result.code ).toEqual ( 0 )
        expect ( result.out ).toEqual ( 'slow 2\nslow 1\nslow 2\nslow 1\nslow 2\nslow 1\n' )
        expect ( result.err ).toEqual ( '' )
        expect ( execution.finished ).toEqual ( true )
        done ()
      } )
    }, 20 )
  } )
} )
describe ( "executors", () => {
  it ( "should have a status that shows the status of the executions", ( done ) => {
    const executor = setup ()
    let slow: SlowParams = { count: 2, delay: 10, stopAt: 2 };
    const execution: Execution<SlowParams> = execute ( executor ) ( SlowExecutor, 1000, slow, slow )
    console.log ( 'slow.stopAt', slow.stopAt )
    slow.stopAt = 1
    setTimeout ( () => {
      expect ( execution.out ).toEqual ( 'slow 2\n' )
      expect ( executorStatus ( executor ) ).toEqual ( {
        "id0": {
          "err": 0, "name": "SlowExecutor", "out": 7,
          "params": { "count": 2, "delay": 10, "stopAt": 1 },
          "time": 0.001, finished: false
        }
      } )
      slow.stopAt = 0
      console.log ( 'slow.stopAt', slow.stopAt )
      setTimeout ( () => {
        expect ( execution.out ).toEqual ( 'slow 2\nslow 1\n' )
        expect ( executorStatus ( executor ) ).toEqual ( {
          "id0": {
            "err": 0, "name": "SlowExecutor", "out": 14,
            "params": { "count": 2, "delay": 10, "stopAt": 0 },
            "time": 0.002, finished: true
          }
        } )
        done ()
      }, 20 )
    }, 20 )
  } )
} )