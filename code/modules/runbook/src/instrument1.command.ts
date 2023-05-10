import { Command } from "commander";
import { findScriptAndDisplay, isScript, makeOutput, scriptExecutable, ScriptInstrument } from "@runbook/scriptinstruments";
import { mapObjValues, nameValueToNameAndString, OS, safeArray } from "@runbook/utils";
import { addDisplayOptions, optionToDisplayFormat } from "./display";
import { jsonToDisplay } from "@runbook/displayformat";
import { addEditViewOptions, executeAndEditViewAndExit } from "./editView";
import { CleanConfig } from "@runbook/config";
import { executeGitInstrument, isGitInstrument } from "@runbook/gitinstruments";
import { makeGitOps } from "@runbook/git";
import { execute, Executor } from "@runbook/executors";

async function executeScript ( executor: Executor, os: OS, name: string, instrument: ScriptInstrument, args: any, cwd: string ) {
  const params = instrument.params === '*' ? nameValueToNameAndString ( safeArray ( args.params ) ) : args
  const res = execute ( executor ) ( scriptExecutable ( os, 'executeScript', args.debug ), 10000, [ name, instrument ], params )
  await res.promise
  // const json = (await res.out).split ( '\n' )
  const json = makeOutput ( args.debug, res.out, args.raw, findScriptAndDisplay ( os ) ( instrument ) )
  const displayFormat = optionToDisplayFormat ( args )
  console.log ( args.raw ? json : jsonToDisplay ( json, displayFormat ) )
}
export function addNewInstrumentCommand ( cwd: string, homeDir: string, os: OS, command: Command, name: string, instrument: ScriptInstrument, withFromsConfig: CleanConfig, executor: Executor ) {
  command.description ( instrument.description )
  const params = instrument.params
  if ( typeof params === 'string' ) {
    if ( params !== '*' ) throw new Error ( 'Cannot handle non * if param is a string at the moment' )
    command.option ( '-p|--params <params...>', 'a space separated name1:value1 name2:value2' )
  } else mapObjValues ( params, ( value, name ) =>
    command.option ( `--${name} <${name}>`, value.description, value.default ) )

  addEditViewOptions ( 'instrument', addDisplayOptions ( command ) )
    .option ( "--debug", "include debug info" )
    .option ( '--config', "Show the json representing the command in the config" );

  command.action ( async (): Promise<void> => {
    const args: any = command.optsWithGlobals ()
    await executeAndEditViewAndExit ( cwd, args, withFromsConfig.instrument?. [ name ], instrument )
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    if ( isScript ( instrument ) ) return await executeScript ( executor, os, name, instrument, args, cwd );
    if ( isGitInstrument ( instrument ) ) return await executeGitInstrument ( makeGitOps ( homeDir ) ) ( 'execute', instrument ) ( args );
    throw new Error ( `Unknown instrument ${instrument}` )
  } )
}