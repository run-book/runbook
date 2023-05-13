import { addCmd, checkStore, FullStore, newStore, Store } from "./store";
import { Middleware } from "./middleware";
import { focusOn, focusQuery, identity, TransformCmd, TransformSet } from "@runbook/optics";
import { processCmdOnlyForTest } from "./processCmds";
import { addListener, StoreListener } from "./listener";

interface TestState {
  a?: number
  b?: string
  commands1?: string[]
  commands2?: string[]
  brokenCmds?: string[]
  processedCommands?: string[]
}
let processedCommandsOpt = focusOn ( identity<TestState> (), 'processedCommands' );
const testMiddleWare1: Middleware<TestState, string> = {
  optional: focusOn ( identity<TestState> (), 'commands1' ),
  process: ( cmds: string[] ) => Promise.resolve ( cmds.map ( c => ({ map: old => [ ...old, c + '_1' ], optional: processedCommandsOpt, default: [] }) ) )
}
const testMiddleWare2: Middleware<TestState, string> = {
  optional: focusOn ( identity<TestState> (), 'commands2' ),
  process: ( cmds: string[] ) => Promise.resolve ( cmds.map ( c => { return ({ map: old => [ ...old, c + '_2' ], optional: processedCommandsOpt, default: [] }); } ) )
}
const testBrokenMiddleWare: Middleware<TestState, string> = {
  optional: focusOn ( identity<TestState> (), 'brokenCmds' ),
  process: ( cmds: string[] ) => {throw new Error ( 'broken' )}
}
const seta2: TransformSet<TestState, number> = { set: 2, optional: focusOn ( identity<TestState> (), 'a' ) }
const setb3: TransformSet<TestState, string> = { set: "two", optional: focusQuery ( identity<TestState> (), 'b' ) }
const brokenCmd: TransformSet<TestState, string> = { will: "cause errors when processed" } as any

function makeTestStore ( ...cmds: TransformCmd<TestState, any>[] ) {
  let store = checkStore ( newStore ( { a: 1 }, 10, testMiddleWare1, testMiddleWare2 ) );
  store.queue = cmds
  return store
}
function makeStoreAndListeners ( ...cmds: TransformCmd<TestState, any>[] ) {
  const store = makeTestStore ( ...cmds )
  const updated: any[] = []
  const errors: any[] = []
  const updateListener: StoreListener<TestState> = {
    updated: async ( s ) => {updated.push ( s )},
    error: async ( s, e ) => {errors.push ( [ s, e ] )}
  }
  addListener ( store, updateListener )
  return { store, updated, errors }
}
const emptyStore: FullStore<TestState> = {
  wait: 10,
  state: { a: 1 },
  queue: [],
  listeners: [],
  middleWare: [ testMiddleWare1, testMiddleWare2 ]
}
describe ( "store", () => {
  describe ( "newStore", () => {
    it ( "should make a store", () => {
      expect ( makeTestStore () ).toEqual ( emptyStore )
    } )
  } )
  describe ( "addCmd", () => {
    it ( "should add a command to the queue", () => {
      const store = makeTestStore ()
      addCmd ( store ) ( seta2 )
      expect ( store ).toEqual ( { ...emptyStore, queue: [ seta2 ] } )
      addCmd ( store ) ( setb3 )
      expect ( store ).toEqual ( { ...emptyStore, queue: [ seta2, setb3 ] } )
    } )
  } )
  describe ( "processCmds - with cmds", () => {
    it ( "should execute the cmds in the queue and clear the queue, notifying the listeners", async () => {
      const { store, errors, updated } = makeStoreAndListeners ( seta2, setb3 )
      await processCmdOnlyForTest ( store )
      expect ( { ...store, listeners: [] } ).toEqual ( { ...emptyStore, queue: [], state: { a: 2, b: 'two' } } )

      expect ( updated ).toEqual ( [ { a: 2, b: 'two' } ] )
      expect ( errors.length ).toEqual ( 0 )
    } )
    it ( "should execute the cmds, not aborting if one of them fails, reporting errors to the listeners", async () => {
      const { store, errors, updated } = makeStoreAndListeners ( seta2, brokenCmd, setb3 )
      await processCmdOnlyForTest ( store )
      expect ( { ...store, listeners: [] } ).toEqual ( { ...emptyStore, queue: [], state: { a: 2, b: 'two' } } )
      expect ( updated ).toEqual ( [ { a: 2, b: 'two' } ] )
      expect ( errors.length === 1 )
      const [ state, e ] = errors[ 0 ]
      expect ( state ).toEqual ( { a: 1 } )//the state at the moment it was executed
      expect ( e.toString () ).toContain ( 'Error: unknown transform {"will"' )
    } )
  } )
  describe ( "processCmds - with middleware", () => {
    it ( "should execute the middleware ", async () => {
      let initialStateForMiddleware = { a: 1, commands1: [ 'a', 'b', 'c' ], commands2: [ 'd', 'e', 'f' ] };
      const { store, errors, updated } = makeStoreAndListeners ( seta2 )
      store.state = initialStateForMiddleware
      await processCmdOnlyForTest ( store )
      let expected = { "a": 2, "commands1": [], "commands2": [] }; //note commands gone but broken still here...
      expect ( store.state ).toEqual ( expected )
      expect ( updated ).toEqual ( [ expected ] )
      expect ( errors.length ).toEqual ( 0 )
      expect ( store.queue.length ).toEqual ( 6 ) // commands moved here transformed by the middleware
      await processCmdOnlyForTest ( store )
      expect ( store.state ).toEqual ( {
        "a": 2,
        "commands1": [],
        "commands2": [],
        "processedCommands": [ "a_1", "b_1", "c_1", "d_2", "e_2", "f_2" ]
      } )
    } )

    it ( "should execute the middleware allowing broken middleware and notifying errors", async () => {
      const { store, errors, updated } = makeStoreAndListeners ( seta2 )
      let initialStateForMiddleware = { a: 1, commands1: [ 'a', 'b', 'c' ], commands2: [ 'd', 'e', 'f' ], brokenCmds: [ 'g', 'h' ] };
      store.middleWare = [ testMiddleWare1, testBrokenMiddleWare, testMiddleWare2 ]
      store.state = initialStateForMiddleware
      await processCmdOnlyForTest ( store )
      expect ( store.state ).toEqual ( { "a": 2, "commands1": [], "commands2": [], brokenCmds: [ 'g', 'h' ] } )
      expect ( updated ).toEqual ( [ { "a": 2, "commands1": [], "commands2": [], brokenCmds: [ 'g', 'h' ] } ] )
      expect ( errors.length ).toEqual ( 1 )
      const [ state, e ] = errors[ 0 ]
      expect ( e.toString () ).toContain ( 'Error: broken' )
      expect ( state ).toEqual ( initialStateForMiddleware )//the state at the moment it was executed
      expect ( store.queue.length ).toEqual ( 6 )
      await processCmdOnlyForTest ( store )
      expect ( store.state ).toEqual ( {
        "a": 2,
        "brokenCmds": [ "g", "h" ], //do we really want this? Poisoned commands? Not sure how to dodge them.... but they shouldn't really happen much. Middleware is simple
        "commands1": [],
        "commands2": [],
        "processedCommands": [ "a_1", "b_1", "c_1", "d_2", "e_2", "f_2" ]
      } )
    } )
  } )
} )