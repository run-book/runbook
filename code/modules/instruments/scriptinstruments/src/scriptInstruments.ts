import { CommonInstrument, ScriptAndDisplay, validateCommonInstrument } from "@runbook/instruments";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { ExecuteScriptFn, ExecuteScriptLinesFn } from "@runbook/scripts";
import { DisplayFormat, stringToJson, TableFormat } from "@runbook/displayformat";
import { composeNameAndValidators, mapObjToArray, NameAnd, NameAndValidator, orValidators, OS, toArray, validateArray, validateBoolean, validateChild, validateChildString, validateItemOrArray, validateNumber, validateString, validateValue } from "@runbook/utils";
import { Executable, ExecutableNextFn, ExecutableOutput, ExecuteFn, ExecutionCommon, ExitCodeAndOutput } from "@runbook/executors";
import cp from 'child_process'

/** This is when the script is shared on both linux and windows */
export interface SharedScriptInstrument extends CommonScript, ScriptAndDisplay {

}


export function isSharedScriptInstrument ( instrument: CommonInstrument ): instrument is SharedScriptInstrument {
  return (instrument as any).script !== undefined
}


export interface VaryingScriptInstrument extends CommonScript {
  windows: ScriptAndDisplay,
  linux: ScriptAndDisplay,
}
export function isVaryingScriptInstument ( instrument: CommonInstrument ): instrument is VaryingScriptInstrument {
  return (instrument as any).windows !== undefined
}
export type ScriptInstrument = VaryingScriptInstrument | SharedScriptInstrument
export function isScript ( instrument: CommonInstrument ): instrument is ScriptInstrument {
  return isSharedScriptInstrument ( instrument ) || isVaryingScriptInstument ( instrument )
}
export interface CommonScript extends CommonInstrument {
  type: 'script'
}

export interface ExecuteOptions {
  debug?: boolean
  executeScript: ExecuteScriptFn,
  executeScripts: ExecuteScriptLinesFn,
  instrument: ScriptInstrument,
  cwd: string
  showCmd?: boolean
  raw?: boolean
}
function findSD ( os: OS, si: ScriptInstrument ): ScriptAndDisplay {
  if ( isVaryingScriptInstument ( si ) ) return os === 'Windows_NT' ? si.windows : si.linux;
  return si
}
function makeCmds ( context: string, sd: ScriptAndDisplay, params: NameAnd<string | number | boolean>, debug: boolean ) {
  const allArgs = mapObjToArray ( params, p => p ).join ( ' ' )
  const argsNames = mapObjToArray ( params, ( p, n ) => n ).join ( ' ' )

  let dic = { ...params, allArgs, argsNames };
  if ( debug ) console.log ( '   dic', JSON.stringify ( dic ) )
  const cmds = toArray ( sd.script ).map ( script => derefence ( context, dic, script, { variableDefn: bracesVarDefn } ) );
  if ( debug ) console.log ( '   cmds', cmds )
  return cmds;
}
interface CmdAndArgs {
  cmd: string
  args: string[]
}


export type NameAndScriptInstrument = [ string, ScriptInstrument ]
export const executeInstrument = ( os: OS, context: string, debug?: boolean ): ExecuteFn<NameAndScriptInstrument> =>
  ( common, outListener, errListener ): ExecutableOutput<NameAndScriptInstrument> => {
    let si: ScriptInstrument = common.t[ 1 ];
    const sd = findSD ( os, si )
    const script = makeCmds ( context, sd, common.params, debug )
    if ( script.length === 0 ) throw Error ( `No script for ${JSON.stringify ( si )}` )
    if ( debug ) console.log ( 'executeInstrument - script', script )
    function executeOne ( common: ExecutionCommon<NameAndScriptInstrument> ): ExecutableOutput<NameAndScriptInstrument> {
      const sp = cp.spawn ( script[ common.stage ], { shell: true } )
      outListener ( sp.stdout )
      errListener ( sp.stderr )
      let promise = new Promise<ExitCodeAndOutput> ( ( resolve ) => sp.on ( 'close', code =>
        resolve ( { code } ) ) );
      return { promise, next }
    }
    let next: ExecutableNextFn<NameAndScriptInstrument> = ( common ) => {
      let result: ExecutableOutput<NameAndScriptInstrument> | undefined = common.stage >= script.length ? undefined : executeOne ( common );
      if ( debug ) console.log ( '  next', common, 'script.length', script.length, 'result', result )
      return result;
    }
    return executeOne ( common )
  }


export const scriptExecutable = ( os: OS, context: string, debug?: boolean ): Executable<[ string, ScriptInstrument ]> => ({
  name: ( [ name, s ] ) => `Script: ${name}`,
  description: ( [ name, s ] ) => s.description,
  execute: executeInstrument ( os, context, debug ),
  params: ( [ name, s ] ) => s.params
});


export function makeOutput ( debug: boolean, res: string, raw: boolean, sd: ScriptAndDisplay ) {
  if ( debug ) console.log ( '   res', JSON.stringify ( res ) )
  let lines = res.split ( '\n' ).map ( t => t.trim () ).filter ( l => l.length > 0 );
  let dispOpt: DisplayFormat = raw ? "raw" : sd.format ? sd.format : { type: "table" };
  if ( debug ) console.log ( '   lines', JSON.stringify ( lines ) )
  if ( debug ) console.log ( '   dispOpt', JSON.stringify ( dispOpt ) )
  let result = stringToJson ( lines, dispOpt );
  if ( debug ) console.log ( '   result', result )
  return result;
}
// export const executeSharedScriptInstrument = ( opt: ExecuteOptions ): ExecuteStriptInstrumentK<ScriptInstrument> =>
//   ( sdFn ) => ( context: string, i: ScriptInstrument, ) => async ( params ) => {
//     let debug = opt.debug;
//     if ( debug ) console.log ( 'executeSharedScriptInstrument', JSON.stringify ( i ) )
//     if ( debug ) console.log ( '  opt', JSON.stringify ( opt ) )
//     if ( i === undefined ) throw new Error ( `Instrument is undefined` )
//     const sd = sdFn ( i )
//     if ( debug ) console.log ( '   sd', JSON.stringify ( sd ) )
//     const cmds = makeCmds ( context, sd, params, debug );
//     const { cwd, showCmd, raw } = opt
//     if ( showCmd ) return cmds.join ( '\n' )
//     if ( debug ) console.log ( '   cmds', JSON.stringify ( cmds ) )
//     let res = await opt.executeScripts ( cwd, cmds );
//     let result = makeOutput ( debug, res, raw, sd );
//     return result
//   }
export const findScriptAndDisplay = ( os: OS ) => ( s: ScriptInstrument ): ScriptAndDisplay => {
  function check ( s: ScriptAndDisplay ): ScriptAndDisplay {
    if ( s?.script === undefined ) throw new Error ( `OS is ${os}. No script for instrument ${s}` )
    return s
  }
  if ( isSharedScriptInstrument ( s ) ) return check ( s )
  else if ( isVaryingScriptInstument ( s ) ) {
    if ( os === 'Windows_NT' ) if ( s.windows ) return check ( s.windows ); else throw new Error ( `No windows script for instrument ${s}` )
    if ( os === 'Linux' ) if ( s.linux ) return check ( s.linux ); else throw new Error ( `No linux script for instrument ${s}` )
    if ( os === 'Darwin' ) if ( s.linux ) return check ( s.linux ); else throw new Error ( `No linux script for instrument ${s}` )
  }
  throw new Error ( `OS is ${os}. Cannot execute instrument type${s}` )
};

// export const executeScriptInstrument = ( opt: ExecuteOptions ): ExecuteStriptInstrumentK<ScriptInstrument> =>
//   sdFn => ( context, i, ) => {
//     if ( i === undefined ) throw new Error ( `Instrument is undefined. Raw was ${JSON.stringify ( i, null, 2 )}` )
//     return async ( params ) =>
//       executeSharedScriptInstrument ( opt ) ( sdFn ) ( context, i, ) ( params );
//   }


const validateTableFormat: NameAndValidator<TableFormat> = composeNameAndValidators<TableFormat> (
  validateChildString ( 'type' ),
  validateChild ( 'headers', validateArray ( validateString () ) as NameAndValidator<string[] | undefined>, true ),
  validateChild ( 'hideFooter', orValidators<any> ( '', validateNumber (), validateBoolean () ), true ),
  validateChild ( 'hideHeader', orValidators<any> ( '', validateNumber (), validateBoolean () ), true ) )


const validateDisplayFormat: NameAndValidator<DisplayFormat | undefined> = orValidators<any> ( `Ìsn't a valid display format`,
  validateTableFormat, validateValue ( 'raw', 'json', 'onelinejson', 'oneperlinejson', 'exitcode', 'exitcode==0' ) )
export const validateScriptAndDisplay: NameAndValidator<ScriptAndDisplay> = composeNameAndValidators (
  validateChild ( 'script', validateItemOrArray ( validateString () ) ),
  validateChild ( 'format', validateDisplayFormat, true )
)
export const validateSharedScriptInstrument: NameAndValidator<SharedScriptInstrument> = composeNameAndValidators<SharedScriptInstrument> (
  validateCommonInstrument,
  validateScriptAndDisplay,
  validateChild ( 'outputColumns', validateArray ( validateString () ) as NameAndValidator<string[] | undefined>, true )
)

export const validateVaryingScriptInstrument: NameAndValidator<VaryingScriptInstrument> = composeNameAndValidators<any> (
  validateCommonInstrument,
  validateChild ( 'windows', validateScriptAndDisplay ),
  validateChild ( 'linux', validateScriptAndDisplay )
)
export const validateScriptInstrument: NameAndValidator<ScriptInstrument> =
               orValidators<any> ( `Ìsn't a valid script`, validateVaryingScriptInstrument, validateSharedScriptInstrument )