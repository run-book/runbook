import { State, Store } from '@sambego/storybook-state';

import { Optional } from "@runbook/optics";
import { RunbookComponent, RunbookState } from "./runbookState";


export interface SBookProps<S, C> {
  s: S,
  id?: string,
  opt: Optional<S, C>,
  children: RunbookComponent<S, C>
  mode: string | undefined
}


const makeState = <S extends any, C> ( store: Store<RunbookState<S, C>>, opt: Optional<S, C> ) => ( s: S ): RunbookState<S, C> => {
  let setS = ( s: S ) => {
    console.log ( 'state change', `${JSON.stringify ( store.state.state, null, 2 )}===>${JSON.stringify ( s, null, 2 )}` );
    store.set ( makeState ( store, opt ) ( s ) );
  };
  return new RunbookState<S, C> ( s, opt, setS )
};
export function SBookStoreFor<S, C> ( props: SBookProps<S, C> ): JSX.Element {
  const { s, opt, children, mode, id } = props
  const realId = id || 'root'
  const store = new Store<RunbookState<S, C>> ( undefined as any );
  store.set ( makeState ( store, opt ) ( s ) );
  return <State store={store}>{brokenRunbookState => {
    const st = RunbookState.clone ( brokenRunbookState )
    console.log ( 'SBookStoreFor -st', st );
    console.log ( 'SBookStoreFor - optget', st.optGet );
    console.log ( 'SBookStoreFor - optGet?.()', st.optGet?. () );
    const focusedOn = st.optGet?. () as any
    return children ( st ) ( { focusedOn, mode, id: realId } );
  }}</State>;
}
export function DisplayStoryBook<S, C> ( props: SBookProps<S, C> ): JSX.Element {
  const { s, opt, children, mode } = props

  return <SBookStoreFor {...props}>{st => props =>
    <div>
      {children ( st ) ( props )}
      <hr/>
      <h3>State</h3>
      <pre>{JSON.stringify ( st.state, null, 2 )}</pre>
    </div>}
  </SBookStoreFor>
}
