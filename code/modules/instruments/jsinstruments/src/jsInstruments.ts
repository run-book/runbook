import { CommonInstrument, ExecuteCommonIntrumentK, validateCommonInstrument } from "@runbook/instruments";
import { composeNameAndValidators, NameAndValidator, validateChild, validateString } from "@runbook/utils";
import { GitOps } from "@runbook/git";

/** This is when the script is shared on both linux and windows */
export interface JSInstrument extends CommonInstrument {
  type: 'js',
  repo: string,//The git repo holding the code
  command: string,
}

export const isJsInstrument = ( instrument: CommonInstrument ): instrument is JSInstrument => (instrument as any).type === 'js'
export const executeJsInstrument = ( gitOps: GitOps ): ExecuteCommonIntrumentK<JSInstrument> =>
  ( context, i ) => {
    if ( i === undefined ) throw new Error ( `Instrument is undefined. Raw was ${JSON.stringify ( i, null, 2 )}` )
    return async ( params ) => {
      const exists = await gitOps.gitExists ( i.repo )
      if ( !exists )
        await gitOps.cloneOrPull ( params.repo.toString () );

    }
  }
export const validateJsInstrument: NameAndValidator<JSInstrument> = composeNameAndValidators<any> (
  validateCommonInstrument,
  validateChild ( 'repo', validateString () ),
  validateChild ( 'command', validateString () )
)