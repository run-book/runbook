import { CleanInstrumentParam, CommonInstrument, ExecuteInstrumentK, ScriptAndDisplay } from "@runbook/instruments";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { ExecuteScriptFn, ExecuteScriptLinesFn } from "@runbook/scripts";
import { DisplayFormat, stringToJson } from "@runbook/displayformat";
import { composeNameAndValidators, mapObjToArray, NameAnd, NameAndValidator, orValidators, OS, toArray, validateArray, validateBoolean, validateChild, validateChildItemOrArray, validateChildNumber, validateChildString, validateChildValue, validateItemOrArray, validateNameAnd, validateNumber, validateString, validateValue } from "@runbook/utils";
import { TableFormat } from "@runbook/displayformat/dist/src/displayFormat";

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
  format: DisplayFormat
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

export const executeSharedScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<ScriptInstrument> =>
  ( context: string, i: ScriptInstrument, sdFn ) => async ( params ) => {
    if ( opt.debug ) console.log ( 'executeSharedScriptInstrument', JSON.stringify ( i ) )
    if ( opt.debug ) console.log ( '  opt', JSON.stringify ( opt ) )
    if ( i === undefined ) throw new Error ( `Instrument is undefined` )
    const sd = sdFn ( i )
    if ( opt.debug ) console.log ( '   sd', JSON.stringify ( sd ) )
    const allArgs = mapObjToArray ( params, p => p ).join ( ' ' )
    const argsNames = mapObjToArray ( params, ( p, n ) => n ).join ( ' ' )

    let dic = { ...params, allArgs, argsNames };
    if ( opt.debug ) console.log ( '   dic', JSON.stringify ( dic ) )
    const cmds = toArray ( sd.script ).map ( script => derefence ( context, dic, script, { variableDefn: bracesVarDefn } ) );
    const { cwd, showCmd, raw } = opt
    if ( showCmd ) return cmds.join ( '\n' )
    if ( opt.debug ) console.log ( '   cmds', JSON.stringify ( cmds ) )
    let res = await opt.executeScripts ( cwd, cmds );
    if ( opt.debug ) console.log ( '   res', JSON.stringify ( res ) )
    let lines = res.split ( '\n' ).map ( t => t.trim () ).filter ( l => l.length > 0 );
    let dispOpt: DisplayFormat = raw ? "raw" : sd.format ? sd.format : { type: "table" };
    if ( opt.debug ) console.log ( '   lines', JSON.stringify ( lines ) )
    if ( opt.debug ) console.log ( '   dispOpt', JSON.stringify ( dispOpt ) )
    let result = stringToJson ( lines, dispOpt );
    if ( opt.debug ) console.log ( '   result', result )
    return result
  }
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

export const executeScriptInstrument = ( opt: ExecuteOptions ): ExecuteInstrumentK<ScriptInstrument> =>
  ( context, i, sdFn ) => {
    if ( i === undefined ) throw new Error ( `Instrument is undefined. Raw was ${JSON.stringify ( i, null, 2 )}` )
    return async ( params ) =>
      executeSharedScriptInstrument ( opt ) ( context, i, sdFn ) ( params );
  }

//  description: string,
//   params: string | NameAnd<CleanInstrumentParam>,
//   staleness: number,
//   cost: InstrumentCost,
const validateCleanInstrumentParam: NameAndValidator<CleanInstrumentParam> = composeNameAndValidators (
  validateChildString ( 'description' ),
  validateChildString ( 'default', true ),
)
//   "format": DisplayFormat,
export const validateCommonScriptIntrument: NameAndValidator<CommonInstrument> = composeNameAndValidators<CommonInstrument> (
  validateChildString ( 'description' ),
  validateChild ( 'params', orValidators<any> ( '', validateNameAnd ( validateCleanInstrumentParam ), validateString () ) ),
  validateChildNumber ( 'staleness', true ),
  validateChildValue ( 'cost', "low", "medium", "high", undefined )
)

const validateTableFormat: NameAndValidator<TableFormat> = composeNameAndValidators<TableFormat> (
  validateChildString ( 'type' ),
  validateChild ( 'headers', validateArray ( validateString () ) as NameAndValidator<string[] | undefined>, true ),
  validateChild ( 'hideFooter', orValidators<any> ( '', validateNumber (), validateBoolean () ), true ),
  validateChild ( 'hideHeader', orValidators<any> ( '', validateNumber (), validateBoolean () ), true ) )


const validateDisplayFormat: NameAndValidator<DisplayFormat | undefined> = orValidators<any> ( `Ìsn't a valid display format`,
  validateTableFormat, validateValue ( 'raw', 'json', 'onelinejson', 'oneperlinejson' ) )
export const validateScriptAndDisplay: NameAndValidator<ScriptAndDisplay> = composeNameAndValidators (
  validateChild ( 'script', validateItemOrArray ( validateString () ) ),
  validateChild ( 'format', validateDisplayFormat, true )
)
export const validateSharedScriptInstrument: NameAndValidator<SharedScriptInstrument> = composeNameAndValidators<SharedScriptInstrument> (
  validateCommonScriptIntrument,
  validateScriptAndDisplay,
  validateChild ( 'outputColumns', validateArray ( validateString () ) as NameAndValidator<string[] | undefined>, true )
)

export const validateVaryingScriptInstrument: NameAndValidator<VaryingScriptInstrument> = composeNameAndValidators<any> (
  validateCommonScriptIntrument,
  validateChild ( 'windows', validateScriptAndDisplay ),
  validateChild ( 'linux', validateScriptAndDisplay )
)
export const validateScriptInstrument: NameAndValidator<ScriptInstrument> =
               orValidators<any> ( `Ìsn't a valid script`, validateVaryingScriptInstrument, validateSharedScriptInstrument )