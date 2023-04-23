import { display, displayChild, isRunbookStateFor, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { isSharedScriptInstrument, isVaryingScriptInstument, ScriptInstrument, SharedScriptInstrument, VaryingScriptInstrument } from "@runbook/scriptinstruments";
import { AttributeValueList, displayLabeledChild, displayLabeledChildWithLabel, displayLabeledQueryChild, integerInput, Layout, optionsInput, textArea, textAreaForObj, textInput } from "@runbook/components";
import { CleanInstrumentParam, CommonInstrument, ScriptAndDisplay } from "@runbook/instruments";
import { mapObjToArray, NameAnd, RefAndData, safeObject } from "@runbook/utils";


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

export function displayNormalParams<S> (): RunbookComponent<S, NameAnd<string>> {
  return st => ( props ) => {
    return <Layout layout={[]}>{
      mapObjToArray ( safeObject ( props.focusedOn ), ( v, k ) => displayLabeledChild ( st, props, textInput (), k ) )
    }</Layout>
  }
}

export function displayParamsFromReference<S> (): RunbookComponent<S, RefAndData<NameAnd<CleanInstrumentParam>, NameAnd<string>>> {
  return st => ( props ) => {
    const data = safeObject ( props.focusedOn?.data )
    mapObjToArray ( safeObject ( props.focusedOn?.ref ), ( { description, default: def }, k ) => {
      if ( data[ k ] === undefined ) data[ k ] = def || ''
    } )
    return displayChild ( st, props, 'data', displayNormalParams () )
  }
}
export function runInstrument<S> (): RunbookComponent<S, RefAndData<ScriptInstrument, NameAnd<CleanInstrumentParam>>> {
  return st => ( props ) => {
    return <div>Not yet done</div>
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


