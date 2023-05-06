import { CommonInstrument, ExecuteCommonIntrumentK, validateCommonInstrument } from "@runbook/instruments";
import { composeNameAndValidators, NameAnd, NameAndValidator, validateChild, validateString } from "@runbook/utils";
import { GitOps } from "@runbook/git";

/** This is when the script is shared on both linux and windows */
export interface JSInstrument extends CommonInstrument {
  type: 'js',
  repo: string,//The git repo holding the code
  command: string,
}

export const isJsInstrument = ( instrument: CommonInstrument ): instrument is JSInstrument => (instrument as any).type === 'js'
async function cloneIfNeeded ( gitOps: GitOps, i: JSInstrument, repo: string ) {
  const exists = await gitOps.gitExists ( i.repo )
  if ( !exists )
    await gitOps.cloneOrPull ( repo );
}
export const executeJsInstrument = ( gitOps: GitOps ): ExecuteCommonIntrumentK<JSInstrument> =>
  ( context, i ) => {
    if ( i === undefined ) throw new Error ( `Instrument is undefined. Raw was ${JSON.stringify ( i, null, 2 )}` )
    return async ( params ) => {
      await cloneIfNeeded ( gitOps, i, params.repo.toString () );
      const dir = gitOps.gitDir ( i.repo )
      const nodeModulesPath = `:${dir}/node_modules`
      const existing = process.env.NODE_PATH
      process.env.NODE_PATH = existing && existing.includes ( nodeModulesPath ) ? existing : `${existing}${nodeModulesPath}`
      const js = require ( `${dir}/dist/index.js}` ) //maybe should parse package.json for main... but that's just time
      let j = js[ i.command ];
      if ( !j ) return { errors: [ `Command ${i.command} not found in ${i.repo}` ] }
      const result = await j ( params )
      return result
    }
  }
export const validateJsInstrument: NameAndValidator<JSInstrument> = composeNameAndValidators<any> (
  validateCommonInstrument,
  validateChild ( 'repo', validateString () ),
  validateChild ( 'command', validateString () )
)