import { focusQuery, getOptional, Optional, setOptional, setOptionalOrOriginal } from "@runbook/optics";

export interface RunbookProps<C> {
  focusedOn?: C
  //If not present the code should default to view
  mode?: string
}
export function modeFromProps<C> ( props: RunbookProps<C> ) {return props.mode ?? 'view'}

export type RunbookComponent<S, C> = ( st: RunbookState<S, C> ) => ( props: RunbookProps<C> ) => JSX.Element
export type RunbookComponentWithProps<C, Props extends RunbookProps<C>> = <S> ( st: RunbookState<S, C> ) => ( props: Props ) => JSX.Element
export interface RunbookPropsWithChildren<C> extends RunbookProps<C> {
  children: React.ReactNode
}

/** When we have a new optional we need to make sure that we call focusedon correctly so that react will detect changes */
export function displayWithNewOpt<S, C> ( r: RunbookComponent<S, C>, opt: Optional<S, C>, st: RunbookState<S, any> ): JSX.Element {
  let runbookState = st.withOpt ( opt );
  return r ( runbookState ) ( { focusedOn: runbookState.optGet () } );
}
export function display<S, C> ( r: RunbookComponent<S, C>, st: RunbookState<S, C> ): JSX.Element {
  return r ( st ) ( { focusedOn: st.optGet () } );
}


export class RunbookState<S, C> {
  readonly state: S;
  readonly opt: Optional<S, C>
  setS: ( s: S ) => void;
  getInCons: any
  constructor ( s: S, opt: Optional<S, C>, setS: ( s: S ) => void ) {
    this.state = s;
    this.opt = opt;
    this.setS = setS;
    this.getInCons = this.get
  }
  static clone<S, C> ( r: RunbookState<S, C> ) {return new RunbookState ( r.state, r.opt, r.setS )}
  focusQuery<K extends keyof C> ( k: K ): RunbookState<S, Required<C[K]>> {
    const newOpt: Optional<S,Required< C[K]>> = focusQuery ( this.opt, k );
    return new RunbookState ( this.state, newOpt, this.setS ) as any;
  }
  set = ( c: C ) => this.setS ( setOptional ( this.opt, this.state, c )! );
  map = ( fn: ( c: C ) => C ) => this.set ( fn ( this.get () ) )
  mapWithDefForFrom ( fn: ( c: C  ) => C, def: C ) {
    const newC = fn ( this.optGet () || def )
    return this.set ( newC )
  }
  optGet (): C | undefined { return getOptional ( this.opt, this.state ) }
  get (): C { return getOptional ( this.opt, this.state )!}
  withOpt<D> ( opt: Optional<S, D> ) {return new RunbookState ( this.state, opt, this.setS )}
}

