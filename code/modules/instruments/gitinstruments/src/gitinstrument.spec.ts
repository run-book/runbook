import { executeGitInstrument, GitInstrument } from "./gitInstruments";
import { GitOps, makeGitOps } from "@runbook/git/dist/src/git";
import * as os from "os";

const gitI = (): GitInstrument => ({
  type: "git",
  command: 'cloneOrPull',
  description: "",
  params: { repo: { description: 'The repo to clone or pull' } },
  staleness: 60000,
})

const gitOps: GitOps = {
  ...makeGitOps ( os.homedir () ),
  cloneOrPull: async ( repo: string ) => `loaded ${repo}`
}

describe ( "gitInstrument", () => {
  it ( "should clone a repo", async () => {
    expect ( await executeGitInstrument ( gitOps ) ( 'someContext', gitI () ) ( { repo: 'someRepo' } ) ).toEqual ( 'loaded someRepo' )
  } )
} )
