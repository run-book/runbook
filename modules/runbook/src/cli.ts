import { Command } from "commander";
import { CleanConfig } from "@runbook/config";
import { mapObjValues, safeObject } from "@runbook/utils";
import { executeScriptInstrument, isVaryingScriptInstument, ScriptInstrument } from "@runbook/scriptinstruments";
import { execute } from "@runbook/scripts";
import { bracesVarDefn, derefence } from "@runbook/variables";


function argumentsForInstrument ( command: Command, instrument: ScriptInstrument ) {
}
function addInstrumentCommand ( cwd: string, command: Command, name: string, instrument: ScriptInstrument ) {
  command.description ( instrument.description )
  mapObjValues ( instrument.params, ( value, name ) =>
    command.option ( `--${name} <${name}>`, value.description, value.default )
      .option ( '-s|--showCmd', "Show the command instead of executing it" )
      .option ( '--config', "Show the json representing the command in the confit" ) )
  command.action ( async () => {
    const args = command.optsWithGlobals ()
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    console.log ( await (executeScriptInstrument ( cwd, args.showCmd ) ( 'runbook', instrument ) ( args )) )
  } )
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
  return program
}


export function processProgram ( program: Command, args: string[] ): Promise<Command> {
  if ( args.length == 2 ) {
    program.outputHelp ();
    process.exit ( 0 );
  }
  return program.parseAsync ( args );
}
