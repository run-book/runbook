import { Command } from "commander";
import { CleanConfig } from "@runbook/config";
import { applyTrueConditions, evaluateViewConditions, View } from "@runbook/views";
import { inheritsFrom, makeStringDag, mapObjValues, NameAnd, Primitive, safeArray, toArray } from "@runbook/utils";
import { BindingContext } from "@runbook/bindings";
import { executeScriptInstrument, findScriptAndDisplay } from "@runbook/scriptinstruments";
import { executeScriptInShell, executeScriptLinesInShell, osType } from "@runbook/scripts";
import { jsonToDisplay } from "@runbook/displayformat";
import { addDisplayOptions, optionToDisplayFormat } from "./display";
import { addEditViewOptions, executeAndEditViewAndExit } from "./editView";
import { fromReferenceData } from "@runbook/referencedata";
import { mereologyToSummary } from "@runbook/mereology";

export function addViewCommand ( command: Command, cwd: string, name: string, configWithFroms: CleanConfig, config: CleanConfig, view: View ) {
  addEditViewOptions ( 'view', addDisplayOptions ( command ) )
    .option ( '-c|--config', "Show the json representing the command in the config" )
    .option ( '-d|--doc', "Show the documentation for this command" )
    .option ( '-b|--bindings', "Just show the bindings for this command" )
    .option ( '-i|--instruments', "Just show the instruments that would be called" )
    .option ( "--debug", "include debug info" )

  command.description ( toArray ( view.description ).join ( " " ) ).action ( async () => {
    await executeAndEditViewAndExit ( cwd, command.optsWithGlobals (), configWithFroms.view?. [ name ], view )
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
      mereology: mereologyToSummary ( config.mereology ),
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
        const instrument = config.instrument[ ift.name ]
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
