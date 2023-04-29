import { findDirectoryHoldingFileOrThrow, readExpected, readTestFile } from "@runbook/files";
import { executeScriptInShell } from "@runbook/scripts";
import * as path from "path";
import * as fs from "fs";
import { toForwardSlash } from "@runbook/utils";

export const inCi = process.env[ 'CI' ] === 'true'
export const codeRootDir = findDirectoryHoldingFileOrThrow ( process.cwd (), "laoban.json" );
export const testRoot = path.resolve ( codeRootDir, '..', 'tests' );
export const codePath = path.resolve ( codeRootDir, "modules/runbook/dist/index.js" )

export function executeRunbook ( cwd: string, cmd: string ): Promise<string> {
  const fullCmd = `node ${codePath} ${cmd}`;
  // console.log ( 'executeRunbook', cwd, fullCmd )
  return executeScriptInShell ( cwd, fullCmd )
}

describe ( 'runbook', () => {

  describe ( "config compose ", () => {
    const configDir = path.resolve ( testRoot, 'config', 'compose' )
    it ( 'happy', async () => {
      const testDir = path.resolve ( configDir, 'happy' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      fs.writeFileSync ( runbookFileName, "{ }" )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'config compose' ) ) ).toEqual ( readExpected ( testDir ) )
      expect ( toForwardSlash ( readTestFile ( runbookDir, 'runbook.json' ) )).toEqual ( readTestFile ( testDir, 'happy.merged.json' ) )
      fs.rmSync ( runbookFileName, { force: true } )
    } )

    it ( 'malformed', async () => {

      const testDir = path.resolve ( configDir, 'malformed' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      fs.rmSync ( runbookFileName, { force: true } )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'config compose' ) ) ).toEqual ( readExpected ( testDir ) )
      expect ( fs.existsSync ( runbookFileName ) ).toBeFalsy ()
    } )
    it ( 'noConfigSubDir', async () => {
      const testDir = path.resolve ( configDir, 'noConfigSubDir' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      fs.rmSync ( runbookFileName, { force: true } )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'config compose' ) ) ).toEqual ( readExpected ( testDir ) )
      expect ( fs.existsSync ( runbookFileName ) ).toBeFalsy ()
    } )
  } )
  describe ( "config issues", () => {
    const configDir = path.resolve ( testRoot, 'config', 'issues' )
    it ( 'happy', async () => {
      const testDir = path.resolve ( configDir, 'happy' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config issues' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'malformed', async () => {
      const testDir = path.resolve ( configDir, 'malformed' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config issues' ) ).toEqual ( readExpected ( testDir ) )

    } )
    it ( 'noConfigSubDir', async () => {
      const testDir = path.resolve ( configDir, 'noConfigSubDir' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config issues' ) ).toEqual ( readExpected ( testDir ) )

    } )
  } )
  describe ( "config validateBeforeCompose", () => {
    const configDir = path.resolve ( testRoot, 'config', 'validateBeforeCompose' )
    it ( 'happy', async () => {
      const testDir = path.resolve ( configDir, 'happy' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config validateBeforeCompose' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'malformed', async () => {
      const testDir = path.resolve ( configDir, 'malformed' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config validateBeforeCompose' ) ).toEqual ( readExpected ( testDir ) )

    } )
    it ( 'noConfigSubDir', async () => {
      const testDir = path.resolve ( configDir, 'noConfigSubDir' )
      const runbookDir = path.join ( testDir, '.runbook' )
      const runbookFileName = path.join ( runbookDir, 'runbook.json' );
      expect ( await executeRunbook ( testDir, 'config validateBeforeCompose' ) ).toEqual ( readExpected ( testDir ) )

    } )
  } )
  describe ( 'instrument', () => {
    const instrumentDir = path.resolve ( testRoot, 'instrument' )
    it ( 'instrument', async () => {
      const testDir = path.resolve ( instrumentDir, 'instrument' )
      expect ( await executeRunbook ( testDir, 'instrument' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'instrument ls', async () => {
      const testDir = path.resolve ( instrumentDir, 'ls' )
      expect ( await executeRunbook ( testDir, 'instrument ls' ) ).toEqual ( readExpected ( testDir ) )
    } )

    it ( 'instrument echo --help', async () => {
      const testDir = path.resolve ( instrumentDir, 'echo', 'help' )
      expect ( await executeRunbook ( testDir, 'instrument echo --help' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'instrument echo --params a:1 b:2', async () => {
      const testDir = path.resolve ( instrumentDir, 'echo' )
      expect ( await executeRunbook ( testDir, 'instrument echo --params a:1 b:2' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'instrument echo (empty)', async () => {
      const testDir = path.resolve ( instrumentDir, 'echo', 'empty' )
      expect ( await executeRunbook ( testDir, 'instrument echo' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'instrument getRepo', async () => {
      const testDir = path.resolve ( instrumentDir, 'getRepo' )
      expect ( await executeRunbook ( testDir, 'instrument getRepo' ) ).toEqual ( readExpected ( testDir ) )
    } )
  } )

  describe ( 'ontology', () => {
    const ontologyDir = path.resolve ( testRoot, 'ontology' )
    it ( 'ontology', async () => {
      const testDir = path.resolve ( ontologyDir, 'ontology' )
      expect ( await executeRunbook ( testDir, 'ontology' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology inheritance', async () => {
      const testDir = path.resolve ( ontologyDir, 'inheritance' )
      expect ( await executeRunbook ( testDir, 'ontology inheritance' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology reference', async () => {
      const testDir = path.resolve ( ontologyDir, 'reference' )
      expect ( await executeRunbook ( testDir, 'ontology reference' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology reference all', async () => {
      const testDir = path.resolve ( ontologyDir, 'reference', 'all' )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'ontology reference all' ) ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology reference direct', async () => {
      const testDir = path.resolve ( ontologyDir, 'reference', 'direct' )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'ontology reference direct' ) ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology reference bound', async () => {
      const testDir = path.resolve ( ontologyDir, 'reference', 'bound' )
      expect ( await executeRunbook ( testDir, 'ontology reference bound' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'ontology mereology', async () => {
      const testDir = path.resolve ( ontologyDir, 'mereology' )
      expect ( await executeRunbook ( testDir, 'ontology mereology' ) ).toEqual ( readExpected ( testDir ) )
    } )
  } )
  describe ( 'view', () => {
    const viewDir = path.resolve ( testRoot, 'view' )
    it ( 'view', async () => {
      const testDir = path.resolve ( viewDir, 'view' )
      expect ( await executeRunbook ( testDir, 'view' ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'view displayGit', async () => {
      const testDir = path.resolve ( viewDir, 'displayGit' )
      expect ( toForwardSlash ( await executeRunbook ( testDir, 'view displayGit' ) ) ).toEqual ( readExpected ( testDir ) )
    } )
    it ( 'view domain', async () => {
      const testDir = path.resolve ( viewDir, 'domain' )
      expect ( await executeRunbook ( testDir, 'view domain' ) ).toEqual ( readExpected ( testDir ) )
    } )
  } )
  describe ( 'situation', () => {
    const situationDir = path.resolve ( testRoot, 'situation' )
    it ( "situation", async () => {
      const testDir = path.resolve ( situationDir, 'situation' )
      expect ( await executeRunbook ( testDir, 'situation' ) ).toEqual ( readExpected ( testDir ) )
    } )
  } )
} )

