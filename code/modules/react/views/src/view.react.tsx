import { displayChild, RunbookComponent } from "@runbook/runbook_state";
import { Fetcher, View } from "@runbook/views";
import { displayLabeledChild, Layout, textArea, textAreaForObj } from "@runbook/components";
import { mapObjToArray, safeObject } from "@runbook/utils";

export function displayFetcher<S> ( name: string ): RunbookComponent<S, Fetcher> {
  return ( st ) => ( props ) => {
    const { focusedOn } = props;
    return <div>
      <h1>{name}</h1>
      <Layout layout={[]} component='displayFetcher'>
        {displayLabeledChild ( st, props, textAreaForObj ( { rows: 10 } ), 'condition' )}
        {displayLabeledChild ( st, props, textAreaForObj ( { rows: 10 } ), 'ifTrue' )}
      </Layout>
    </div>
  };

}
export function displayView<S> ( name: string ): RunbookComponent<S, View> {
  return ( st ) => ( props ) => {
    const { focusedOn } = props;
    const stForFetcher = st.focusQuery ( 'fetchers' )
    const children = [
      <h1>View {name}</h1>,
      displayLabeledChild ( st, props, textAreaForObj ( { rows: 10 } ), 'description' ),
      displayLabeledChild ( st, props, textAreaForObj ( { rows: 10 } ), 'usage' ),
      displayLabeledChild ( st, props, textAreaForObj ( { rows: 10 } ), 'preconditions' ),
      ...mapObjToArray ( safeObject ( focusedOn?.fetchers ), ( fetcher, name ) =>
        displayChild ( stForFetcher, props, name as any, displayFetcher ( name ) ) )
    ]
    return <div>
      <h1>View</h1>
      <Layout layout={[ [ 4, 1, 1, 1 ] ]} component='displayView' children={children}></Layout>
    </div>
  };
}