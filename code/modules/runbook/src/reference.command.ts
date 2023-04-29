import { Command } from "commander";
import { allDataFor, ReferenceData } from "@runbook/referencedata";

export function addOntologyCommand ( command: Command, name: string, thing: any, description: string ) {
  return command.command ( name ).description ( description )
    .action ( async () => {
      console.log ( JSON.stringify ( thing, null, 2 ) )
    } )


}

export function addAllReferenceCommands ( ontCmd: Command, name: string, reference: ReferenceData, description: string ) {

  const refCmd = ontCmd.command ( name ).description ( description )
  refCmd.command ( 'all' ).description ( description ).action ( () => console.log ( JSON.stringify ( reference, null, 2 ) ) )
  refCmd.command ( 'for' )
    .description ( 'Retreive the reference data about one thing, For example \'leo:service\' means get me all the reference data about the service leo' )
    .argument ( '<thing>', `for example 'leo:service' means get me all the reference data about the service leo` )
    .action ( ( thing ) => console.log ( JSON.stringify ( allDataFor ( reference ) ( thing ), null, 2 ) ) )

}