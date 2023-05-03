import { cloneOrPull, gitClone, gitCloneToRunbookHome, gitDir, gitReallyPullToRunbookHome } from "./git";
import { promises as fs } from "fs";
import path from "path";
import * as os from "os";
import { toForwardSlash } from "@runbook/utils";

let repo = "https://github.com/run-book/testRepo1.git";

describe ( "gitDir", () => {
  it ( "should return a path from the home directory with a clean repo name", () => {
    const home = "/home/user"
    expect ( toForwardSlash ( gitDir ( home, repo ) ) ).toEqual ( '/home/user/.runbook/git/https_github_com_run-book_testRepo1_git' )
  } )
} )
async function prepareDirectory ( file: string ) {
  await fs.mkdir ( file, { recursive: true } )
  await fs.rm ( file, { recursive: true, force: true } )
}
describe ( "git clone", () => {
  it ( "should clone a repo to a directory", async () => {
    const home = os.homedir ()
    let file = path.join ( home, ".runbook/.tests/testRepo1" );
    await prepareDirectory ( file );
    const actual = await gitClone ( process.cwd (), repo, file )
    console.log ( actual )
    let stats = await fs.stat ( path.join ( file, 'README.md' ) )
    expect ( stats.isFile () ).toBeTruthy ()
  } )
  it ( " gitCloneToRunbookHome", async () => {
    const home = os.homedir ()
    const dir = gitDir ( home, repo )
    await prepareDirectory ( dir );
    console.log ( await gitCloneToRunbookHome ( home, repo ) )
    let stats = await fs.stat ( path.join ( dir, 'README.md' ) )
    expect ( stats.isFile () ).toBeTruthy ()
  } )

  it ( 'gitReallyPullToRunbookHome', async () => {
    const home = os.homedir ()
    const dir = gitDir ( home, repo )
    await prepareDirectory ( dir );
    console.log ( await gitCloneToRunbookHome ( home, repo ) )
    await fs.writeFile ( path.join ( dir, 'README1.md' ), 'test' )
    await fs.writeFile ( path.join ( dir, 'README.md' ), 'junk' )
    await gitReallyPullToRunbookHome ( home, repo )

    expect ( async () => await fs.stat ( path.join ( dir, 'README1.md' ) ) ).rejects.toThrow ( 'no such file or directory' )
    expect ( await fs.readFile ( path.join ( dir, 'README.md' ), 'utf-8' ) ).toEqual ( expect.stringContaining ( 'A test repo' ) )
  } )

  it ( "cloneOrPull", async () => {
    const home = os.homedir ()
    const dir = gitDir ( home, repo )
    await prepareDirectory ( dir );
    console.log ( await cloneOrPull ( home, repo ) )
    await fs.stat ( path.join ( dir, 'README.md' ) )
    await fs.writeFile ( path.join ( dir, 'README1.md' ), 'test' )
    await fs.writeFile ( path.join ( dir, 'README.md' ), 'junk' )
    await cloneOrPull ( home, repo )
    expect ( async () => await fs.stat ( path.join ( dir, 'README1.md' ) ) ).rejects.toThrow ( 'no such file or directory' )
    expect ( await fs.readFile ( path.join ( dir, 'README.md' ), 'utf-8' ) ).toEqual ( expect.stringContaining ( 'A test repo' ) )

  } )
} )