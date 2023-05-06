import path, * as Path from "path";
import fs from "fs";
import { cleanLineEndings, ErrorsAnd, isErrors, mapErrors, parseJson } from "@runbook/utils";

export function findInParent ( directory: string, acceptor: ( filename: string ) => boolean ): string | undefined {
  function find ( dir: string ): string | undefined {
    if ( acceptor ( dir ) ) return dir
    let parse = path.parse ( dir )
    if ( parse.dir === parse.root ) return undefined
    return find ( parse.dir )
  }
  return find ( directory )
}
export function findDirectoryHoldingFileOrError ( directory: string, file: string ): ErrorsAnd<string> {
  const dir = findInParent ( directory, dir => fs.existsSync ( Path.join ( dir, file ) ) )
  if ( dir === undefined ) return { errors: [ `Cannot find ${file}. Started looking in ${directory}` ] }
  return dir
}
export async function loadAndParseFile<T> ( file: string ): Promise<ErrorsAnd<T>> {
  async function loadFile () {
    try {
      return (await fs.promises.readFile ( file )).toString ( 'utf-8' );
    } catch ( e: any ) {
      return { errors: [ `Error loading file ${file}: ${e}` ] }
    }
  }
  let json: ErrorsAnd<T> = mapErrors ( await loadFile (), parseJson<T> )
  return json
}
export function loadFileInDirectory ( cwd: string, errorString: string, marker: string, filenameFn: ( dir: string ) => string ) {
  const dir = findDirectoryHoldingFileOrError ( cwd, marker )
  if ( isErrors ( dir ) ) return dir
  const file = filenameFn ( Path.join ( dir, marker ) )
  try {
    const contents = fs.readFileSync ( file ).toString ( 'utf-8' )
    try {
      return JSON.parse ( contents )
    } catch ( e: any ) {
      return { errors: [ `Error parser ${errorString} from  ${file}: ${e}` ] }
    }
  } catch ( e: any ) {
    return { errors: [ `Error loading ${errorString}  from ${file}: ${e}` ] }
  }

}

export function findDirectoryHoldingFileOrThrow ( directory: string, file: string ): string {
  const dir = findDirectoryHoldingFileOrError ( directory, file )
  if ( isErrors ( dir ) ) throw dir;
  return dir;
}

export function findFileInParentsOrError ( directory: string, file: string ): ErrorsAnd<string> {
  return mapErrors ( findDirectoryHoldingFileOrError ( directory, file ), dir => Path.join ( dir, file ) );
}
export function readTestFile ( dir: string, file: string ) {
  return cleanLineEndings ( fs.readFileSync ( Path.join ( dir, file ), 'utf8' ) )
}

export function readExpected ( dir: string ) {
  return readTestFile ( dir, 'expected.txt' )
}