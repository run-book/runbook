import { State, Store } from '@sambego/storybook-state';

import { Optional } from "@runbook/optics";
import { RunbookComponent, RunbookState } from "./runbookState";


export interface SBookProps<S, C> {
  s: S,
  opt: Optional<S, C>,
  children: RunbookComponent<S, C>
  mode: string|undefined
}


const makeState = <S extends any, C> ( store: Store<RunbookState<S, C>>, opt: Optional<S, C> ) => ( s: S ): RunbookState<S, C> => {
  let setS = ( s: S ) => {
    console.log ( 'state change', `${JSON.stringify ( store.state.state, null, 2 )}===>${JSON.stringify ( s, null, 2 )}` );
    store.set ( makeState ( store, opt ) ( s ) );
  };
  return new RunbookState<S, C> ( s, opt, setS )
};
export function SBookStoreFor<S, C> ( { s, opt, children, mode }: SBookProps<S, C> ): JSX.Element {
  const store = new Store<RunbookState<S, C>> ( undefined as any );
  store.set ( makeState ( store, opt ) ( s ) );
  return <State store={store}>{brokenRunbookState => {
    const st = RunbookState.clone ( brokenRunbookState )
    console.log ( 'SBookStoreFor -st', st );
    console.log ( 'SBookStoreFor - optget', st.optGet );
    console.log ( 'SBookStoreFor - optGet?.()', st.optGet?. () );
    const focusedOn = st.optGet?. () as any
    return children ( st ) ( { focusedOn, mode } );
  }}</State>;
}
export function DisplayStoryBook<S, C> ( { s, opt, children, mode }: SBookProps<S, C> ): JSX.Element {
  return <SBookStoreFor s={s} opt={opt} mode={mode}>{st => props =>
    <div>
      {children ( st ) ( props )}
      <hr/>
      <h3>State</h3>
      <pre>{JSON.stringify ( st.state, null, 2 )}</pre>
    </div>}
  </SBookStoreFor>
}
