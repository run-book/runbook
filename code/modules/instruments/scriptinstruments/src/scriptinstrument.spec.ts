import { ExecuteOptions, findScriptAndDisplay, scriptExecutable, SharedScriptInstrument, validateScriptInstrument, VaryingScriptInstrument } from "./scriptInstruments";
import { execute, Executor } from "@runbook/executors";
import { osType } from "@runbook/scripts";
import { cleanLineEndings } from "@runbook/utils";

const sharedI = ( script: string ): SharedScriptInstrument => ({
  type: "script",
  script,
  description: "",
  format: { type: "table" },
  params: '*',
  staleness: 5000,
})
export const varying = ( sW: string, sL: string ): VaryingScriptInstrument => ({
  linux: sharedI ( sL ),
  windows: sharedI ( sW ),
  description: "",
  params: '*',
  type: "script",
})
const si = sharedI ( `A B\n1 2 3\n4 5 6` )
let sv = varying ( `WA WB\n1 2 3\n4 5 6`, `LA LB\n1 2 3\n4 5 6` );
describe ( "findShared", () => {
  it ( "should detect shared", () => {
    expect ( findScriptAndDisplay ( 'Windows_NT' ) ( si ) ).toBe ( si )
  } )
  it ( "should detect windows", () => {
    expect ( findScriptAndDisplay ( 'Windows_NT' ) ( sv ) ).toBe ( sv.windows )
  } )
  it ( "should detect linux", () => {
    expect ( findScriptAndDisplay ( 'Linux' ) ( sv ) ).toBe ( sv.linux )
  } )
} )

let sdFn = findScriptAndDisplay ( 'Windows_NT' );
// describe ( 'executeSharedScriptInstrument', function () {
//   const opt: ExecuteOptions = {
//     executeScript: ( cwd, cmd ) => Promise.resolve ( `${cwd} ${cmd}` ),
//     executeScripts: ( cwd, cmd ) => Promise.resolve ( `${cwd} ${cmd}` ),
//     instrument: si,
//     cwd: 'theCwd',
//     showCmd: false,
//     raw: false
//   }
// it ( 'should execute a shared script when format table', async () => {
//   let actual = await executeSharedScriptInstrument ( opt ) ( sdFn ) ( 'context', { ...si, format: { type: 'table', hideHeader: true } } ) ( {} );
//   console.log ( 'actual', typeof actual, actual )
//   expect ( actual ).toEqual ( [ { theCwd: '1', A: '2', B: '3' }, { theCwd: '4', A: '5', B: '6' } ] )
// } )
// it ( 'should execute a shared script when format undefined', async () => {
//   let actual = await executeSharedScriptInstrument ( opt ) ( sdFn ) ( 'context', si ) ( {} );
//   console.log ( 'actual', typeof actual, actual )
//   expect ( actual ).toEqual ( [
//     { '1': 'theCwd', '2': 'A', '3': 'B' },
//     { '1': '1', '2': '2', '3': '3' },
//     { '1': '4', '2': '5', '3': '6' }
//   ] )
// } )
// it ( 'should execute a shared script, raw is true', async () => {
//   let actual = await executeSharedScriptInstrument ( { ...opt, raw: true } ) ( sdFn ) ( 'context', si ) ( {} );
//   console.log ( 'actual', typeof actual, actual )
//   expect ( actual ).toEqual ( `theCwd A B
// 1 2 3
// 4 5 6` )
//   } )
// } );

describe ( 'validateScriptInstrument', () => {
  it ( 'should validate the fixture script instruments', () => {
    expect ( validateScriptInstrument ( 'prefix' ) ( sharedI ( 'someScript' ) ) ).toEqual ( [] )
    expect ( validateScriptInstrument ( 'prefix' ) ( varying ( 'win', 'linux' ) ) ).toEqual ( [] )
  } )
  it ( "should report errors", () => {
    expect ( validateScriptInstrument ( 'prefix' ) ( {} as any ) ).toEqual ( [
      "prefix Ìsn't a valid script. Either",
      "  prefix.description is undefined",
      "  prefix.params is undefined",
      "  prefix.windows is undefined",
      "  prefix.linux is undefined",
      "or",
      "  prefix.description is undefined",
      "  prefix.params is undefined",
      "  prefix.script is undefined"
    ] )
    expect ( validateScriptInstrument ( 'prefix' ) ( { windows: 1, linux1: 1 } as any ) ).toEqual ( [
      "prefix Ìsn't a valid script. Either",
      "  prefix.description is undefined",
      "  prefix.params is undefined",
      "  prefix.windows does not have script as it is of type number and not an object",
      "  prefix.windows does not have format as it is of type number and not an object",
      "  prefix.linux is undefined",
      "or",
      "  prefix.description is undefined",
      "  prefix.params is undefined",
      "  prefix.script is undefined"
    ] )

  } )
} )


function setup (): Executor {
  let id = 0
  let date = 10000
  return { date: () => date++, nextId: () => "id" + id++, active: {} }
}
const oneEchos: SharedScriptInstrument = {
  type: "script",
  script: "echo 1",
  description: "",
  format: { type: "table" },
  params: {},
}
const threeEchos: SharedScriptInstrument = {
  type: "script",
  script: [ "echo 1", "echo 2", "echo 3" ],
  description: "",
  format: { type: "table" },
  params: {},
}
describe ( "script executor", () => {
  it ( "should execute a shared script that is just one line", ( done ) => {
    const executor = setup ()
    const execution = execute ( executor ) ( scriptExecutable ( osType (), 'someContext', false ),
      5000, [ 'oneEchos', oneEchos ], {} )
    execution.promise.then ( result => {
      expect ( execution.finished ).toEqual ( true )
      expect ( cleanLineEndings ( execution.out ) ).toEqual ( cleanLineEndings ( '1\n' ) )
      expect ( execution.err ).toEqual ( '' )
      expect ( result.code ).toEqual ( 0 )
      done ()
    } )
  } )
  it ( "should execute a shared script that is multiple lines", ( done ) => {
    const executor = setup ()
    const execution = execute ( executor ) ( scriptExecutable ( osType (), 'someContext', false ),
      5000, [ 'threeEchos', threeEchos ], {} )
    setTimeout ( () => {
      expect ( execution.finished ).toEqual ( true )
      expect ( cleanLineEndings ( execution.out ) ).toEqual ( cleanLineEndings ( '1\n2\n3\n' ) )
      expect ( execution.err ).toEqual ( '' )
      execution.promise.then ( result => {
        expect ( result.code ).toEqual ( 0 )
        done ()
      } )
    }, 100 )
  } )
} )