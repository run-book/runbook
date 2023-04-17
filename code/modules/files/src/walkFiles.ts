import fs from 'fs'
import path from "path";
import * as util from "util";

const astat = util.promisify ( fs.stat );
const areaddir = util.promisify ( fs.readdir );


export async function walkDirectory(dir: string): Promise<string[]> {
  let files: string[] = await walkDirectoryPrim(dir);
  return flatten(files);
}
//https://stackoverflow.com/questions/52189973/recursive-directory-listing-using-promises-in-node-js
function flatten(arr) {
  return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten), []);
}
 async function walkDirectoryPrim ( dir: string ) {
  // Get this directory's contents
  const files = await areaddir ( dir );
  // Wait on all the files of the directory
  return Promise.all ( files
    // Prepend the directory this file belongs to
    .map ( f => path.join ( dir, f ) )
    // Iterate the files and see if we need to recurse by type
    .map ( async f => {
      // See what type of file this is
      const stats = await astat ( f );
      // Recurse if it is a directory, otherwise return the filepath
      return stats.isDirectory () ? walkDirectoryPrim ( f ) : f;
    } ) );
}