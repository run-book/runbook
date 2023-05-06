import * as os from "os";
import * as fs from "fs";
import { cloneGitRepoAndParentsIfNeeded, defaultCloneGitRepoAndparentsIfNeeded, parentsFromPathAndField } from "./git.parents";
import { makeGitOps } from "./git";
import path from "path";

async function setup () {
  const tempDir = path.join ( os.tmpdir (), `cloneTest/test${Math.floor ( Math.random () * 1000000 )}` );
  const gitOps = makeGitOps ( tempDir )
  await fs.promises.rm ( tempDir, { recursive: true, force: true } );
  let cloner = defaultCloneGitRepoAndparentsIfNeeded ( gitOps)
     return { tempDir, cloner, gitOps }
}

const repo1 = 'https://github.com/run-book/testRepo1.git';
const repo2 = 'https://github.com/run-book/testRepo2.git';

describe ( "cloneGitRepoAndParentsIfNeeded integration test", () => {
  it ( "should clone the repo and parents: testRepo2 which doesn't have a parent", async () => {
    const { cloner, tempDir, gitOps } = await setup ()
    expect ( await cloner ( repo2 ) ).toEqual ( [ repo2 ] )
    let readMePath = path.join ( gitOps.gitDir ( repo2 ), 'README.md' );
    expect ( fs.readFileSync ( readMePath ).toString ( 'utf-8' ) ).toContain ( 'This is testRepo2' )
  } )

  it ( "should clone the repo and parents: testRepo1 which has testRepo2 as a parent", async () => {
    const { cloner, tempDir, gitOps } = await setup ()
    expect ( await cloner ( repo1 ) ).toEqual ( [ repo1, repo2 ] )
    expect ( fs.readFileSync ( path.join ( gitOps.gitDir ( repo1 ), 'README.md' ) ).toString ( 'utf-8' ) ).toContain ( 'This is testRepo1' )
    expect ( fs.readFileSync ( path.join ( gitOps.gitDir ( repo2 ), 'README.md' ) ).toString ( 'utf-8' ) ).toContain ( 'This is testRepo2' )
  } )
} )