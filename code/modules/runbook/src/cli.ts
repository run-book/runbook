import { Command } from "commander";
import { CleanConfig, validateConfig } from "@runbook/config";
import { inheritsFrom, makeStringDag, mapObjValues, NameAnd, nameValueToNameAndString, Primitive, safeArray, safeObject, toArray } from "@runbook/utils";
import { executeScriptInstrument, findScriptAndDisplay, ScriptInstrument } from "@runbook/scriptinstruments";
import { executeScriptInShell, executeScriptLinesInShell, osType } from "@runbook/scripts";
import { jsonToDisplay } from "@runbook/displayformat";
import { applyTrueConditions, evaluateViewConditions, View } from "@runbook/views";
import { fromReferenceData, ReferenceData } from "@runbook/mereology";
import { BindingContext } from "@runbook/bindings";

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

  const params = instrument.params
  if ( typeof params === 'string' ) {
    if ( params !== '*' ) throw new Error ( 'Cannot handle non * if param is a string at the moment' )
    command.option ( '-p|--params <params...>', 'a space separated name1:value1 name2:value2' )
  } else mapObjValues ( params, ( value, name ) =>
    command.option ( `--${name} <${name}>`, value.description, value.default ) )
  command.option ( '-s|--showCmd', "Show the command instead of executing it" )
    .option ( '-r|--raw', "Show the raw output instead of formatting it" )
    .option ( "-j|--json", "Show the output as json" )
    .option ( "--onelinejson", "Show the output as json" )
    .option ( "-1|--oneperlinejson", "Show the output as json" )
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
function addViewCommand ( command: Command, cwd: string, name: string, config: CleanConfig, view: View ) {
  command
    .option ( '-c|--config', "Show the json representing the command in the config" )
    .option ( '-d|--doc', "Show the documentation for this command" )
    .option ( '-b|--bindings', "Just show the bindings for this command" )
    .option ( '-i|--instruments', "Just show the instruments that would be called" )
    .option ( '-s|--showCmd', "Show the command instead of executing it" )
    .option ( '-r|--raw', "Show the raw output instead of formatting it" )
    .option ( "-j|--json", "Show the output as json" )
    .option ( "--onelinejson", "Show the output as json" )
    .option ( "-1|--oneperlinejson", "Show the output as json" )
    .option ( "--debug", "include debug info" )

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
    const bc: BindingContext = {
      debug: false,
      mereology: config.mereology,
      refDataFn: fromReferenceData ( config.reference ),
      inheritsFrom: inheritsFrom ( makeStringDag ( config.inheritance ) )
    }
    const bindings = evaluateViewConditions ( bc, view ) ( config.situation )
    if ( opts.bindings ) {
      console.log ( 'Bindings for view', name )
      mapObjValues ( bindings, ( bs, name ) => {
        console.log ( name )
        if ( bs?.length === 0 ) console.log ( '  nothing' )
        bs.forEach ( b => console.log ( '  ' + JSON.stringify ( b ) ) )
      } )
    }
    const trueConditions = applyTrueConditions ( view ) ( bindings )
    if ( opts.instruments ) {
      mapObjValues ( trueConditions, ( ifTrues, name ) => {
        console.log ( name )
        if ( ifTrues.length === 0 ) console.log ( '  nothing' )
        ifTrues.forEach ( ifTrue =>
          console.log ( '  ', ifTrue.name, JSON.stringify ( ifTrue.params ), '==>', ifTrue.addTo, '/', safeArray ( ifTrue.binding[ ifTrue.addTo ]?.path ).join ( '.' ) )
        )
      } )
    }
    if ( opts.bindings || opts.instruments ) return
    mapObjValues ( trueConditions, async ( ifTrues, name ) => {
      for ( let iftName in ifTrues ) {
        const ift = ifTrues[ iftName ]
        const instrument = config.instruments[ ift.name ]
        if ( instrument === undefined ) console.log ( 'cannot find instrument ', ift.name )
        else {
          let params = ift.params;
          const paramsForExecution: NameAnd<Primitive> = params === '*' ? mapObjValues ( ift.binding, b => b.value ) : params

          let json = await (executeScriptInstrument ( {
            ...opts, cwd, instrument,
            debug: opts.debug,
            executeScript: executeScriptInShell,
            executeScripts: executeScriptLinesInShell
          } ) ( 'runbook', instrument, findScriptAndDisplay ( osType () ) ) ( paramsForExecution ));
          const displayFormat = optionToDisplayFormat ( opts )
          console.log ( opts.raw ? json : jsonToDisplay ( json, displayFormat ) )
        }
      }
    } )
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
function addSituationCommand ( command: Command, config: CleanConfig ) {
  command.action ( async () => {
    console.log ( JSON.stringify ( config.situation ) )
  } )
}
export function makeProgram ( cwd: string, config: CleanConfig, version: string ): Command {
  let program = new Command ()
    .name ( 'run-book' )
    .usage ( '<command> [options]' )
    // .allowUnknownOption ( true )
    .version ( version )

  const instruments = program.command ( 'instrument' ).description ( `Instruments are the raw tools that find things out` )
  mapObjValues ( safeObject ( config?.instruments ), ( instrument, name ) =>
    addInstrumentCommand ( cwd, instruments.command ( name ), name, instrument ) )

  const views: Command = program.command ( 'view' ).description ( 'Commands to work with views which allow you to find things out about systems' )
  mapObjValues ( safeObject ( config?.views ), ( view, name ) => addViewCommand ( views.command ( name ), cwd, name, config, view ) )
  const ontology: Command = program.command ( 'ontology' ).description ( `Commands to view the 'ontology': relationships and meanings and reference data` )
  addOntologyCommand ( ontology, 'inheritance', config.inheritance, `This is the classical 'isa' relationship. For example a cat isa mammel` )
  addOntologyCommand ( ontology, 'mereology', config.mereology, `This describes 'is part of' for example a wheel is part of a car` )
  addAllReferenceCommands ( ontology, 'reference', config.reference, `Reference data such as 'the git repo for this service is here'` )

  addSituationCommand ( program.command ( 'situation' ).description ( 'Commands about the current situation: the ticket you are working on, or a playground' ), config )

  const configCmd: Command = program.command ( 'config' ).description ( 'Views the config and any issues with it' )
    .action ( async () => {
      const errors = validateConfig ( 'config' ) ( config )
      const msg = [ errors.length === 0 ? 'No errors' : 'Errors in config', ...errors ]
      msg.forEach ( x => console.log ( x ) )
    } )

  return program
}


export function processProgram ( program: Command, args: string[] ): Promise<Command> {
  if ( args.length == 2 ) {
    program.outputHelp ();
    process.exit ( 0 );
  }
  return program.parseAsync ( args );
}
