import { cloneGitRepoAndParentsIfNeeded, parentsFromPathAndField } from "./git.parents";
import { isErrors } from "@runbook/utils";

function makeHappyPathGitCloneFn () {
  const gitCloneFn = jest.fn ()
  gitCloneFn.mockReturnValue ( Promise.resolve ( "some ignored text that would normally be displayed in the terminal" ) )
  return gitCloneFn;
}
describe ( "cloneGitRepoAndParentsIfNeeded", () => {
  describe ( "happy path", () => {
    it ( "should fetch a repo with no parents", async () => {
      const gitCloneFn = makeHappyPathGitCloneFn ();
      const parentFn = () => Promise.resolve ( [] )
      expect ( isErrors ( await cloneGitRepoAndParentsIfNeeded ( gitCloneFn, parentFn ) ( "someRepo" ) ) ).toBeFalsy ()
      expect ( gitCloneFn.mock.calls ).toEqual ( [ [ "someRepo" ] ] )
    } )
    it ( "should fetch a repo with a parent", async () => {
      const gitCloneFn = makeHappyPathGitCloneFn ();
      const parentFn = repo => Promise.resolve ( repo === 'someRepo' ? [ 'parent' ] : [] )
      expect ( isErrors ( await cloneGitRepoAndParentsIfNeeded ( gitCloneFn, parentFn ) ( "someRepo" ) ) ).toBeFalsy ()
      expect ( gitCloneFn.mock.calls ).toEqual ( [
        [ "someRepo" ],
        [ "parent" ]
      ] )
    } )
    it ( "should fetch a repo with multiple parents", async () => {
      const gitCloneFn = makeHappyPathGitCloneFn ();
      const parentFn = repo => Promise.resolve ( repo === 'someRepo' ? [ 'p1', 'p2', 'p3' ] : [] )
      expect ( isErrors ( await cloneGitRepoAndParentsIfNeeded ( gitCloneFn, parentFn ) ( "someRepo" ) ) ).toBeFalsy ()
      expect ( gitCloneFn.mock.calls ).toEqual ( [
        [ "someRepo" ],
        [ "p1" ],
        [ "p2" ],
        [ "p3" ]
      ] )
    } )
    it ( "should fetch a repo with multiple parents and grandparents", async () => {
      const parentFn = repo => Promise.resolve ( repo.length < 3 ? [ `${repo}1`, `${repo}2` ] : [] )
      const gitCloneFn = makeHappyPathGitCloneFn ();
      expect ( isErrors ( await cloneGitRepoAndParentsIfNeeded ( gitCloneFn, parentFn ) ( "p" ) ) ).toBeFalsy ()
      expect ( gitCloneFn.mock.calls ).toEqual ( [
        [ "p" ],
        [ "p1" ],
        [ "p2" ],
        [ "p11" ],
        [ "p12" ],
        [ "p21" ],
        [ "p22" ]
      ] )
    } )
  } )
} )

function gitDirFn () {
  return ( repo: string ) => {
    if ( repo !== 'someRepo' ) throw Error ( `expected 'repo' got ${repo}` )
    return 'tests'
  }

}
describe ( "parentsFromPathAndField", () => {
  it ( "should return the parents - happy pathy", async () => {
    expect ( await parentsFromPathAndField ( gitDirFn (), "withParents.json", "path.to.parents" ) ( 'someRepo' ) ).toEqual ( [ 'p1', 'p2' ] )
  } )
  it ( "should return empty if parents don't exist ", async () => {
    expect ( await parentsFromPathAndField ( gitDirFn (), "withOutParents.json", "path.to.parents" ) ( 'someRepo' ) ).toEqual ( [] )
  } )
  it ( "should return an error if the file doesn't exist", async () => {
    const actual = await parentsFromPathAndField ( gitDirFn (), "noSuchFile", "path.to.parents" ) ( 'someRepo' )
    expect ( isErrors ( actual ) ).toBeTruthy ()
    const errors = (actual as any).errors
    expect ( errors.length ).toBe ( 1 )
    expect ( errors[ 0 ] ).toContain ( 'Error loading file' )
  } )
  it ( "should return an error if the field is not an array", async () => {
    const actual = await parentsFromPathAndField ( gitDirFn (), "withDodgyParents.json", "path.to.parents" ) ( 'someRepo' )
    expect ( actual ).toEqual ( {
      "errors": [
        "Repo: someRepo file: tests\\withDodgyParents.json, path: path.to.parents was not an array it was {\"not\":\"an array\"}"
      ]
    } )
  } )
} )