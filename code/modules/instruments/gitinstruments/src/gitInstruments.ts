import { CommonInstrument, ExecuteCommonIntrumentK, validateCommonInstrument } from "@runbook/instruments";
import { composeNameAndValidators, NameAndValidator, validateChild, validateNameAnd, validateString } from "@runbook/utils";
import { GitOps } from "@runbook/git";

/** This is when the script is shared on both linux and windows */
export interface GitInstrument extends CommonInstrument {
  type: 'git',
  command: 'cloneOrPull',
  params: {
    repo: {
      description?: string,
      default?: string
    }
  }
}

export const isGitInstrument = ( instrument: CommonInstrument ): instrument is GitInstrument => (instrument as any).type === 'git'
export const executeGitInstrument = ( gitOps: GitOps ): ExecuteCommonIntrumentK<GitInstrument> =>
  ( context, i ) => {
    if ( i === undefined ) throw new Error ( `Instrument is undefined. Raw was ${JSON.stringify ( i, null, 2 )}` )
    return async ( params ) =>
      gitOps.cloneOrPull ( params.repo.toString () );
  }
export const validateGitInstrument: NameAndValidator<GitInstrument> = composeNameAndValidators<any> (
  validateCommonInstrument,
  validateChild ( 'params', validateNameAnd ( validateString () ) )
)