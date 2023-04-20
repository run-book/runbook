import { focusQuery, getOptional, Optional, setOptional } from "@runbook/optics";


export class RunbookState<S, C> {
  readonly state: S;
  private readonly opt: Optional<S, C>
  private readonly setS: ( s: S ) => void;
  getInCons: any
  constructor ( s: S, opt: Optional<S, C>, setS: ( s: S ) => void ) {
    this.state = s;
    this.opt = opt;
    this.setS = setS;
    this.getInCons = this.get
  }
  focusQuery<K extends keyof C> ( k: K ): RunbookState<S, Required<C[K]>> {
    const newOpt: Optional<S, C[K]> = focusQuery ( this.opt, k );
    return new RunbookState ( this.state, newOpt, this.setS ) as any;
  }
  set = ( c: C ) => this.setS ( setOptional ( this.opt, this.state, c )! );
  optGet (): C | undefined { return getOptional ( this.opt, this.state ) }
  get (): C { return getOptional ( this.opt, this.state )!}
}

