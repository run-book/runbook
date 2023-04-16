import { Command } from "commander";
import { CleanConfig } from "@runbook/config";
import { mapObjValues, safeObject, toArray } from "@runbook/utils";
import { executeScriptInstrument, ScriptInstrument } from "@runbook/scriptinstruments";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { jsonToDisplay } from "@runbook/displayformat";
import { View } from "@runbook/views";
import { ReferenceData } from "@runbook/mereology";

function optionToDisplayFormat ( args: any ) {
  if ( args.raw ) return 'raw'
  if ( args.json ) return 'json'
  if ( args.onelinejson ) return 'onelinejson'
  if ( args.oneperlinejson ) return 'oneperlinejson'
  return 'oneperlinejson'
}


function argumentsForInstrument ( command: Command, instrument: ScriptInstrument ) {
}
function addInstrumentCommand ( cwd: string, command: Command, name: string, instrument: ScriptInstrument ) {
  command.description ( instrument.description )
  mapObjValues ( instrument.params, ( value, name ) =>
    command.option ( `--${name} <${name}>`, value.description, value.default )
      .option ( '-s|--showCmd', "Show the command instead of executing it" )
      .option ( '-r|--raw', "Show the raw output instead of formatting it" )
      .option ( "-j|--json", "Show the output as json" )
      .option ( "--onelinejson", "Show the output as json" )
      .option ( "-1|--oneperlinejson", "Show the output as json" )
      .option ( '--config', "Show the json representing the command in the config" ) )
  command.action ( async () => {
    const args: any = command.optsWithGlobals ()
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    let json = await (executeScriptInstrument ( { ...args, os: osType (), cwd, instrument, executeScript: executeScriptInShell } ) ( 'runbook', instrument ) ( args ));

    const displayFormat = optionToDisplayFormat ( args )
    console.log ( args.raw ? json : jsonToDisplay ( json, displayFormat ) )
  } )
}
function addViewCommand ( command: Command, name: string, view: View ) {
  command.option ( '-s|--showCmd', "Show the command instead of executing it" )
    .option ( '-c|--config', "Show the json representing the command in the config" )
    .option ( '-d|--doc', "Show the documentation for this command" )

  command.description ( toArray ( view.description ).join ( " " ) ).action ( async () => {
    const opts = command.optsWithGlobals ()
    if ( opts.config ) {
      console.log ( JSON.stringify ( view, null, 2 ) )
      return
    }
    if ( opts.doc ) {
      [ 'Description', ...toArray ( view.description ), '', 'Preconditions', ...toArray ( view.preconditions ), '', 'usage', ...toArray ( view.usage ) ]
        .forEach ( x => console.log ( x ) )
    }
  } )
}


function addOntologyCommand ( command: Command, name: string, thing: any, description: string ) {
  return command.command ( name ).description ( description )
    .action ( async () => {
      console.log ( JSON.stringify ( thing, null, 2 ) )
    } )


}
function addReferenceCommand ( refCmd: Command, name: string, data: any, description: string ) {
  refCmd.command ( name ).description ( description ).action ( () => console.log ( JSON.stringify ( data, null, 2 ) ) )
}
function addAllReferenceCommands ( ontology: Command, name: string, reference: ReferenceData, description: string ) {
  const ontCmd = ontology.command ( name ).description ( description )
  addReferenceCommand ( ontCmd, 'all', reference, 'All the reference data' )
  addReferenceCommand ( ontCmd, 'direct', reference?.direct, 'All the data that can be looked up given the namespace and name' )
  addReferenceCommand ( ontCmd, 'bound', reference?.bound, `Data that needs more context. Such as 'this service in this environment'` )
}
export function makeProgram ( cwd: string, config: CleanConfig, version: string ): Command {
  let program = new Command ()
    .name ( 'run-book' )
    .usage ( '<command> [options]' )
    // .allowUnknownOption ( true )
    .version ( version )

  const instruments = program.command ( 'instrument' )
  mapObjValues ( safeObject ( config?.instruments ), ( instrument, name ) =>
    addInstrumentCommand ( cwd, instruments.command ( name ), name, instrument ) )

  const views: Command = program.command ( 'view' )
  mapObjValues ( safeObject ( config?.views ), ( view, name ) => {
    addViewCommand ( views.command ( name ), name, view )
  } )
  const ontology: Command = program.command ( 'ontology' )
  addOntologyCommand ( ontology, 'inheritance', config.inheritance, `This is the classical 'isa' relationship. For example a cat isa mammel` )
  addOntologyCommand ( ontology, 'mereology', config.mereology, `This describes 'is part of' for example a wheel is part of a car` )
  addAllReferenceCommands ( ontology, 'reference', config.reference, `Reference data such as 'the git repo for this service is here'` )
  return program
}


export function processProgram ( program: Command, args: string[] ): Promise<Command> {
  if ( args.length == 2 ) {
    program.outputHelp ();
    process.exit ( 0 );
  }
  return program.parseAsync ( args );
}
