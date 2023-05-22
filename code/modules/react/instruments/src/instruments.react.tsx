import { display, displayChild, displayWithNewOpt, isRunbookStateFor, RunbookComponent, RunbookState } from "@runbook/runbook_state";
import { isSharedScriptInstrument, isVaryingScriptInstument, ScriptInstrument, SharedScriptInstrument, VaryingScriptInstrument } from "@runbook/scriptinstruments";
import { AttributeValueList, displayLabeledChild, displayLabeledChildWithLabel, displayLabeledQueryChild, integerInput, labelAnd, Layout, optionsInput, textArea, textAreaForObj, textInput } from "@runbook/components";
import { CleanInstrumentParam, CommonInstrument, ScriptAndDisplay } from "@runbook/instruments";
import { mapObjToArray, NameAnd, RefAndData, safeObject, Tuple3 } from "@runbook/utils";
import { focusOnJustA3, focusOnJustB3, focusQuery, getOptional, Optional, optionalForRefAndData } from "@runbook/optics";
import { FetchCommand } from "@runbook/commands";
import { StatusEndpointData } from "@runbook/executors";


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
      {/*{displayLabeledChild ( st, props, textAreaForObj ( { rows: 5 } ), 'format' )}*/}
    </>
  }
}


export function displayParamsFromReference<S> (): RunbookComponent<S, RefAndData<NameAnd<CleanInstrumentParam>, NameAnd<string>>> {
  return st => ( props ) => {
    const data = safeObject ( props.focusedOn?.data )
    console.log ( 'displayParamsFromReference - initial data', { ...data } )
    console.log ( 'displayParamsFromReference - ref', props.focusedOn?.ref )
    //Here there is a little pain. We have the clean instruments that are the reference info and the data that is the actual data.
    //We need to display the data, handle the default and make sure the label comes from the description
    //So we are walking down two data structures at once
    const dataSt = st.focusQuery ( 'data' )
    return <>{
      mapObjToArray ( safeObject ( props.focusedOn?.ref ), ( { description, default: def }, k ) =>
        displayLabeledChild ( dataSt, props, textInput (), k ) ) //just need how to work out default
    }</>

  }
}

function paramDataOptional<S> ( st: RunbookState<S, ScriptInstrument> ) {
  const dataOpt = focusQuery ( st.opt, 'paramData' as any )// this is the cheat. We create this space for the data to live
  return dataOpt;
}
/** OK A bit of a cheat going on here. We add a 'paramData' field to the instrument which isn't there to store the data */
export function displayParamsFromInstrument<S> (): RunbookComponent<S, ScriptInstrument> {//TODO Merge with displayParamsFromReference
  return st => ( props ) => {
    const dataOpt = paramDataOptional ( st );
    const refOpt: Optional<S, NameAnd<CleanInstrumentParam>> = focusQuery ( st.opt, 'params' ) as Optional<S, NameAnd<CleanInstrumentParam>>
    const instrAndDataOpt = optionalForRefAndData ( refOpt, dataOpt )
    console.log ( 'displayParamsFromInstrument', instrAndDataOpt )
    console.log ( 'displayParamsFromInstrument - date and ref', getOptional ( instrAndDataOpt, st.state ) )
    return displayWithNewOpt ( st, props, instrAndDataOpt, displayParamsFromReference<S> () )
  }
}

const runButtonOnClick = <S extends any> ( fetchCommandOpt: Optional<S, FetchCommand[]>, name: string, id: string, target: string ) => ( st: RunbookState<S, ScriptInstrument> ) => {
  const dataOpt = paramDataOptional ( st );
  const params = getOptional ( dataOpt, st.state )
  const instrument = st.optGet ()
  return async () => {
    let url = window.location.href + 'execute';
    const body = { execute: { [ id ]: { name, params } } }
    const cmd: FetchCommand = {
      requestInfo: url, requestInit: { method: 'POST', body: JSON.stringify ( body ), headers: { "Content-Type": "application/json" } },
      target
    }
    console.log ( 'runButtonOnClick', cmd )
    st.withOpt ( fetchCommandOpt ).set ( [ cmd ] )
  }
};
export function displayRunForInstrument<S> ( fetchCommandOpt: Optional<S, FetchCommand[]>, name: string, id: string, target: string ): RunbookComponent<S, Tuple3<ScriptInstrument, any, NameAnd<StatusEndpointData>>> {
  return st => ( props ) => {
    const stForInstrument = st.withOpt ( focusOnJustA3 ( st.opt ) )
    const stForInstrumentResult: RunbookState<S, any> = st.withOpt ( focusOnJustB3 ( st.opt ) )
    const instResult = stForInstrumentResult.optGet ()
    const cacheId = instResult?.instrument?.cacheId
    const status: NameAnd<StatusEndpointData> = st.optGet ()?.c || {}
    const statusForCacheId = status[ cacheId ]
    return <>
      <h1>Run</h1>
      <Layout layout={[[3,2,2]]}>
      <h2>Params</h2>
      {display ( stForInstrument, props, displayParamsFromInstrument<S> () )}
      <button onClick={runButtonOnClick ( fetchCommandOpt, name, id, target ) ( stForInstrument )}>Run!!</button>
      <h2>Result from end point</h2>
      {display ( stForInstrumentResult, { ...props, mode: 'view' }, textAreaForObj ( { rows: 5 } ) )}
      <h2>Result from executor</h2>
      <pre>{JSON.stringify ( statusForCacheId, null, 2 )}</pre>
    </Layout>
    </>
  }
}

export function displayVaryingInstrument<S> (): RunbookComponent<S, VaryingScriptInstrument> {
  return st => ( props ) =>
    <AttributeValueList {...props}>
      <Layout layout={[ [ 1, 1, 1 ] ]} component='displayVaryingInstrument'>
        {displayCommonScriptInstrument<S, VaryingScriptInstrument> () ( st ) ( props )}
        {displayChild ( st, props, 'linux', scriptAndDisplay<S, ScriptAndDisplay> ( 'Linux' ), )}
        {displayChild ( st, props, 'windows', scriptAndDisplay<S, ScriptAndDisplay> ( 'Windows' ), )}
      </Layout>
    </AttributeValueList>
}

export function displaySharedInstrument<S> (): RunbookComponent<S, SharedScriptInstrument> {
  return st => ( props ) =>
    <AttributeValueList {...props}>
      <Layout layout={[ [ 1, 1 ] ]} component='displaySharedInstrument'>
        {displayCommonScriptInstrument<S, SharedScriptInstrument> () ( st ) ( props )}
        {display ( st, props, scriptAndDisplay<S, SharedScriptInstrument> ( undefined ) )}
      </Layout>
    </AttributeValueList>
}

export function displayScriptInstrument<S> ( fetchCommandOpt: Optional<S, FetchCommand[]>, name: string, id: string, target: string ): RunbookComponent<S, Tuple3<ScriptInstrument, any, NameAnd<StatusEndpointData>>> {
  return st => ( props ) => {
    console.log ( 'displayScriptInstrument', st )
    const stForInstrument = st.withOpt ( focusOnJustA3 ( st.opt ) )
    return <div><h1>Instrument</h1>
      <Layout layout={[ 1, 1, 1 ]} component='displayScriptInstrument'>
        {isRunbookStateFor ( stForInstrument, isSharedScriptInstrument ) && display<S, SharedScriptInstrument> ( stForInstrument, props, displaySharedInstrument<S> () )}
        {isRunbookStateFor ( stForInstrument, isVaryingScriptInstument ) && display<S, VaryingScriptInstrument> ( stForInstrument, props, displayVaryingInstrument<S> () )}
        {display ( st, { ...props, mode: 'run' },  displayRunForInstrument<S> ( fetchCommandOpt, name, id, target )  )}
      </Layout>
    </div>
  }
}


