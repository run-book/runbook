import { State, Store } from '@sambego/storybook-state';
import { ReactNode } from "react";
import { RunbookState } from "./runbookState";
import { Optional } from "@runbook/optics";


// type SBookProviderI = <S>( initialState: S, component: ( s: LensState<Store<S>, S, Context<S>> ) => ReactNode ) => JSX.Element;

export interface SBookChildProps<S, C> {
  st: RunbookState<S, C>
}
export interface SBookProviderProps<S, C, Args> {
  s: S,
  opt: Optional<S, C>,
  args: Args,
  children: ( s: SBookChildProps<S, C> & Args ) => ReactNode
}


export function SBookProvider<S, C, Args> ( { s, opt, args, children }: SBookProviderProps<S, C, Args> ): JSX.Element {
  const store = new Store<RunbookState<S, C>> ( makeState ( s ) );
  console.log ( 'store', store )
  function makeState ( s: S ): RunbookState<S, C> {
    let setS = ( s: S ) => {
      console.log ( 'state change', `${JSON.stringify ( store.state.state, null, 2 )}===>${JSON.stringify ( s, null, 2 )}` );
      store.set ( makeState ( s ) );
    };
    let result = new RunbookState<S, C> ( s, opt, setS );
    return result
  }
  return <State store={store}>{s => {
    const st: any = s
    const params: Args & SBookChildProps<S, C> = { ...args, st: new RunbookState ( st.state, st.opt, st.setS ) }
    return children ( params );
  }}</State>;
}

export function StateForStoryBook<S, C, Args> ( { s, opt, args, children }: SBookProviderProps<S, C, Args> ): JSX.Element {
  return <SBookProvider s={s} args={args} opt={opt}>
    {args => <>{children ( args )}
      <hr/>
      <h3>State</h3>
      <pre>{JSON.stringify ( args.st.state, null, 2 )}</pre>
    </>}
  </SBookProvider>
}