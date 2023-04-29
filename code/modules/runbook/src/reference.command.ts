import { Command } from "commander";
import { ReferenceData } from "@runbook/referencedata";

export function addOntologyCommand ( command: Command, name: string, thing: any, description: string ) {
  return command.command ( name ).description ( description )
    .action ( async () => {
      console.log ( JSON.stringify ( thing, null, 2 ) )
    } )


}
function addReferenceCommand ( refCmd: Command, name: string, data: any, description: string ) {
  refCmd.command ( name ).description ( description ).action ( () => console.log ( JSON.stringify ( data, null, 2 ) ) )
}
export function addAllReferenceCommands ( ontology: Command, name: string, reference: ReferenceData, description: string ) {
  // const ontCmd = ontology.command ( name ).description ( description )
  addReferenceCommand ( ontology, 'reference', reference, description )
  // addReferenceCommand ( ontCmd, 'direct', reference?.direct, 'All the data that can be looked up given the namespace and name' )
  // addReferenceCommand ( ontCmd, 'bound', reference?.bound, `Data that needs more context. Such as 'this service in this environment'` )
}