import { ExecuteOptions, executeSharedScriptInstrument, findShared, SharedScriptInstrument, VaryingScriptInstrument } from "./scriptInstruments";

const sharedI = ( script: string ): SharedScriptInstrument => ({
  type: "script",
  script,
  cost: undefined,
  description: "",
  format: undefined,
  params: undefined,
  staleness: 5000,
})
export const varying = ( sW: string, sL: string ): VaryingScriptInstrument => ({
  linux: sharedI ( sL ),
  windows: sharedI ( sW ),
  cost: undefined,
  format: undefined,
  description: "",
  params: undefined,
  staleness: 0,
  type: "script",
})
const si = sharedI ( `A B\n1 2 3\n4 5 6` )
let sv = varying ( `WA WB\n1 2 3\n4 5 6`, `LA LB\n1 2 3\n4 5 6` );
describe ( "findShared", () => {
  it ( "should detect shared", () => {
    expect ( findShared ( 'Windows_NT', si ) ).toBe ( si )
  } )
  it ( "should detect windows", () => {
    expect ( findShared ( 'Windows_NT', sv ) ).toBe ( sv.windows )
  } )
  it ( "should detect linux", () => {
    expect ( findShared ( 'Linux', sv ) ).toBe ( sv.linux )
  } )
} )

describe ( 'executeSharedScriptInstrument', function () {
  const opt: ExecuteOptions = {
    os: 'Windows_NT',
    executeScript: ( cwd, cmd ) => Promise.resolve ( `${cwd} ${cmd}` ),
    executeScripts: ( cwd, cmd ) => Promise.resolve ( `${cwd} ${cmd}` ),
    instrument: si,
    cwd: 'theCwd',
    showCmd: false,
    raw: false
  }
  it ( 'should execute a shared script when format table', async () => {
    let actual = await executeSharedScriptInstrument ( opt ) ( 'context', { ...si, format: { type: 'table', hideHeader: true } } ) ( {} );
    console.log ( 'actual', typeof actual, actual )
    expect ( actual ).toEqual ( [ { theCwd: '1', A: '2', B: '3' }, { theCwd: '4', A: '5', B: '6' } ] )
  } )
  it ( 'should execute a shared script when format undefined', async () => {
    let actual = await executeSharedScriptInstrument ( opt ) ( 'context', si ) ( {} );
    console.log ( 'actual', typeof actual, actual )
    expect ( actual ).toEqual ( [
      { '1': 'theCwd', '2': 'A', '3': 'B' },
      { '1': '1', '2': '2', '3': '3' },
      { '1': '4', '2': '5', '3': '6' }
    ] )
  } )
  it ( 'should execute a shared script, raw is true', async () => {
    let actual = await executeSharedScriptInstrument ( { ...opt, raw: true } ) ( 'context', si ) ( {} );
    console.log ( 'actual', typeof actual, actual )
    expect ( actual ).toEqual ( `theCwd A B
    1 2 3
    4 5 6` )
  } )
} );