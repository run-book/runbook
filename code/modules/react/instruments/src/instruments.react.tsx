import { display, displayChild, isRunbookStateFor, RunbookComponent, RunbookProps, RunbookState } from "@runbook/runbook_state";
import { isSharedScriptInstrument, isVaryingScriptInstument, ScriptInstrument, SharedScriptInstrument, VaryingScriptInstrument } from "@runbook/scriptinstruments";
import { AttributeValueList, displayLabeledChild, displayLabeledChildWithLabel, displayLabeledQueryChild, integerInput, optionsInput, textArea, textAreaForObj } from "@runbook/components";
import { CommonInstrument, ScriptAndDisplay } from "@runbook/instruments";
import { Layout } from "@runbook/components";


export function scriptAndDisplay<S, C extends ScriptAndDisplay> ( prefix: string | undefined ): RunbookComponent<S, C> {
  const description = ( d: string ) => [ ...prefix ? [ prefix ] : [], d ].join ( '.' )
  return st => props => {
    return <>
      {displayLabeledChildWithLabel ( st, props, textAreaForObj ( { rows: 5 } ), description, 'script' )}
      {displayLabeledChildWithLabel ( st, props, textAreaForObj ( { rows: 5 } ), description, 'format' )}
      {displayLabeledChildWithLabel ( st, props, textAreaForObj ( { rows: 5 } ), description, 'outputColumns' )}
    </>
  }
}


export function displayCommonScriptInstrument<S, C extends CommonInstrument> (): RunbookComponent<S, C> {
  return st => ( props ) => {
    return <>
      {displayLabeledChild ( st, props, textArea ( { rows: 5 } ), 'description' )}
      {displayLabeledQueryChild ( st, props, integerInput (), 'staleness' )}
      {displayLabeledQueryChild ( st, props, optionsInput (), 'cost' )}
      {displayLabeledChild ( st, props, textAreaForObj ( { rows: 3 } ), 'params' )}
      {displayLabeledChild ( st, props, textAreaForObj ( { rows: 5 } ), 'format' )}
    </>
  }
}

export function displayVaryingInstrument<S> (): RunbookComponent<S, VaryingScriptInstrument> {
  return st => ( props ) =>
    <AttributeValueList {...props}>
      <Layout layout={[ [ 1, 1, 1 ] ]}>
        {displayCommonScriptInstrument<S, VaryingScriptInstrument> () ( st ) ( props )}
        {displayChild ( st, props, 'linux', scriptAndDisplay<S, ScriptAndDisplay> ( 'Linux' ), )}
        {displayChild ( st, props, 'windows', scriptAndDisplay<S, ScriptAndDisplay> ( 'Windows' ), )}
      </Layout>
    </AttributeValueList>
}

export function displaySharedInstrument<S> (): RunbookComponent<S, SharedScriptInstrument> {
  return st => ( props ) =>
    <AttributeValueList {...props}>
      <Layout layout={[ [ 1, 1 ] ]}>
        {displayCommonScriptInstrument<S, SharedScriptInstrument> () ( st ) ( props )}
        {display ( st, props, scriptAndDisplay<S, SharedScriptInstrument> ( undefined ) )}
      </Layout>
    </AttributeValueList>
}

export function displayScriptInstrument<S> (): RunbookComponent<S, ScriptInstrument> {
  return st => ( props ) => {
    return <div><h1>Instrument</h1>
      {isRunbookStateFor ( st, isSharedScriptInstrument ) && display<S, SharedScriptInstrument> ( st, props, displaySharedInstrument<S> () )}
      {isRunbookStateFor ( st, isVaryingScriptInstument ) && display<S, VaryingScriptInstrument> ( st, props, displayVaryingInstrument<S> () )}
    </div>
  }
}


