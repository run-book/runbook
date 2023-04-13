import { Command } from "commander";
import { CleanConfig } from "@runbook/config";
import { mapObjValues, NameAnd, safeObject } from "@runbook/utils";
import { executeScriptInstrument, isVaryingScriptInstument, ScriptInstrument } from "@runbook/scriptinstruments";
import { execute } from "@runbook/scripts";
import { bracesVarDefn, derefence } from "@runbook/variables";
import { jsonToDisplay } from "@runbook/displayformat";


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
      .option ( '--config', "Show the json representing the command in the confit" ) )
  command.action ( async () => {
    const args: any = command.optsWithGlobals ()
    if ( args.config ) return console.log ( JSON.stringify ( instrument, null, 2 ) )
    let json = await (executeScriptInstrument ( { ...args, cwd, instrument } ) ( 'runbook', instrument ) ( args ));

    function optionToDisplayFormat ( args: any ) {
      if ( args.raw ) return 'raw'
      if ( args.json ) return 'json'
      if ( args.onelinejson ) return 'onelinejson'
      if ( args.oneperlinejson ) return 'oneperlinejson'
      return 'oneperlinejson'
    }
    const displayFormat = optionToDisplayFormat ( args )
    console.log ( args.raw ? json : jsonToDisplay ( json, displayFormat ) )
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
