import { Command } from "commander";
import { executeScriptInstrument, findScriptAndDisplay, ScriptInstrument } from "@runbook/scriptinstruments";
import { mapObjValues, nameValueToNameAndString, safeArray } from "@runbook/utils";
import { executeScriptInShell, executeScriptLinesInShell, osType } from "@runbook/scripts";
import { addDisplayOptions, optionToDisplayFormat } from "./display";
import { jsonToDisplay } from "@runbook/displayformat";

export function addInstrumentCommand ( cwd: string, command: Command, name: string, instrument: ScriptInstrument ) {
  command.description ( instrument.description )
  const params = instrument.params
  if ( typeof params === 'string' ) {
    if ( params !== '*' ) throw new Error ( 'Cannot handle non * if param is a string at the moment' )
    command.option ( '-p|--params <params...>', 'a space separated name1:value1 name2:value2' )
  } else mapObjValues ( params, ( value, name ) =>

    command.option ( `--${name} <${name}>`, value.description, value.default ) )
  addDisplayOptions ( command ).option ( '-s|--showCmd', "Show the command instead of executing it" )
    .option ( "--debug", "include debug info" )
    .option ( '--config', "Show the json representing the command in the config" )

  command.action ( async () => {
    const args: any = command.optsWithGlobals ()
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    const sdFn = findScriptAndDisplay ( osType () )
    const params = instrument.params === '*' ? nameValueToNameAndString ( safeArray ( args.params ) ) : args
    let json = await (executeScriptInstrument ( {
      ...args, cwd, instrument, executeScript: executeScriptInShell,
      executeScripts: executeScriptLinesInShell
    } ) ( 'runbook', instrument, sdFn ) ( params ));

    const displayFormat = optionToDisplayFormat ( args )
    console.log ( args.raw ? json : jsonToDisplay ( json, displayFormat ) )
  } )
}