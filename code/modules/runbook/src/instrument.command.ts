import { Command } from "commander";
import { executeScriptInstrument, findScriptAndDisplay, ScriptInstrument } from "@runbook/scriptinstruments";
import { mapObjValues, nameValueToNameAndString, safeArray } from "@runbook/utils";
import { executeScriptInShell, executeScriptLinesInShell, osType } from "@runbook/scripts";
import { addDisplayOptions, optionToDisplayFormat } from "./display";
import { jsonToDisplay } from "@runbook/displayformat";
import { addEditViewOptions, executeAndEditViewAndExit } from "./editView";
import { CleanConfig } from "@runbook/config";
import { Script } from "vm";

export function makeExecuteOptions ( args: any, cwd: string, instrument: ScriptInstrument ) {
  return {
    ...args, cwd, instrument, executeScript: executeScriptInShell,
    executeScripts: executeScriptLinesInShell
  };
}
export async function executeScriptForCmd ( instrument: ScriptInstrument, args: any, cwd: string ){
  const params = instrument.params === '*' ? nameValueToNameAndString ( safeArray ( args.params ) ) : args
  let executeOptions = makeExecuteOptions ( args, cwd, instrument );
  const sdFn = findScriptAndDisplay ( osType () )
  let json = await (executeScriptInstrument ( executeOptions ) ( 'runbook', instrument, sdFn ) ( params ));
  return json
}
export function addInstrumentCommand ( cwd: string, command: Command, name: string, instrument: ScriptInstrument, withFromsConfig: CleanConfig ) {
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

  command.action ( async () => {
    const args: any = command.optsWithGlobals ()
    await executeAndEditViewAndExit ( cwd, args, withFromsConfig.instrument?. [ name ], instrument )
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    let json = await executeScriptForCmd ( instrument, args, cwd );
    const displayFormat = optionToDisplayFormat ( args )
    console.log ( args.raw ? json : jsonToDisplay ( json, displayFormat ) )
  } )
}