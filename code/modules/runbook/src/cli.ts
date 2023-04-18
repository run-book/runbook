import { Command } from "commander";
import { CleanConfig } from "@runbook/config";
import { mapObjValues, safeObject } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { addAllReferenceCommands, addOntologyCommand } from "./reference.command";
import { addViewCommand } from "./view.command";
import { addInstrumentCommand } from "./instrument.command";
import { addConfigCommand } from "./config.command";


function argumentsForInstrument ( command: Command, instrument: ScriptInstrument ) {
}


function addSituationCommand ( command: Command, config: CleanConfig ) {
  command.action ( async () => {
    console.log ( JSON.stringify ( config.situation ) )
  } )
}
export function makeProgram ( cwd: string, withFromsConfig: CleanConfig, cleanConfig: CleanConfig, version: string ): Command {
  let program = new Command ()
    .name ( 'run-book' )
    .usage ( '<command> [options]' )
    // .allowUnknownOption ( true )
    .version ( version )

  const instruments = program.command ( 'instrument' ).description ( `Instruments are the raw tools that find things out` )
  mapObjValues ( safeObject ( cleanConfig?.instrument ), ( instrument, name ) =>
    addInstrumentCommand ( cwd, instruments.command ( name ), name, instrument ) )

  const views: Command = program.command ( 'view' ).description ( 'Commands to work with views which allow you to find things out about systems' )
  mapObjValues ( safeObject ( cleanConfig?.view ), ( view, name ) => addViewCommand ( views.command ( name ), cwd, name, cleanConfig, view ) )
  const ontology: Command = program.command ( 'ontology' ).description ( `Commands to view the 'ontology': relationships and meanings and reference data` )
  addOntologyCommand ( ontology, 'inheritance', cleanConfig.inheritance, `This is the classical 'isa' relationship. For example a cat isa mammel` )
  addOntologyCommand ( ontology, 'mereology', cleanConfig.mereology, `This describes 'is part of' for example a wheel is part of a car` )
  addAllReferenceCommands ( ontology, 'reference', cleanConfig.reference, `Reference data such as 'the git repo for this service is here'` )

  addSituationCommand ( program.command ( 'situation' ).description ( 'Commands about the current situation: the ticket you are working on, or a playground' ), cleanConfig )

  addConfigCommand ( program.command ( 'config' ).description ( 'Views the cleanConfig and any issues with it' ), cleanConfig, cwd );

  const gui: Command = program.command ( 'gui' ).description ( 'Starts the gui' ).action ( () => {

    console.log ( 'starting gui' )
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
