#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import { deepCombineTwoObjects, flatMap, flatMapEntries } from "@runbook/utils";
import { bracesVarDefn, derefence, dollarsBracesVarDefn } from "@runbook/variables";

export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}
function setupProgram () {
  let program = new Command ()
    .name ( 'jmxsetup' )
    .description ( `produces json to help config azure application insights with jmx
    
    Given a file (defaults to 'jmx.json') it produces the json to configure azure application insights with jmx on jboss
    
    The file has the following format:
    {"template":{ the main azure config file}
    "jmx": {
    "db or jmx or whatever...it's just a name":{
       "nameFormat: "for example 'java.lang:type=DataSource,class=javax.sql.DataSource,name={name}'",
        "attributes": ["...list of attributes to monitor..."],
         "names": ["...list of names to monitor..."]
    },
    ...
    }    
    ` )
    // .allowUnknownOption ( true )
    .version ( findVersion () )
  return program;
}


export function processProgram ( program: Command, args: string[] ): Command {
  return program.parse ( args );
}

let program = setupProgram ();
program.argument ( "<files...>", 'the files that holds the data' )
  .action ( ( files, options, cmd ) => {
    const fileContents = files.map ( loadFile ).map ( processFile )
    const merged = fileContents.reduce ( ( acc, cur ) => deepCombineTwoObjects(acc, cur), {} )
    console.log ( JSON.stringify ( merged, null, 2 ) )
  } )

const parsed = processProgram ( program, process.argv )


function mergeAction ( files: string[], options: any ) {

}
const files = parsed.args
if ( !Array.isArray ( files ) ) {
  console.error ( `files is not an array` )
  process.exit ( 1 )
}
if ( files.length === 0 ) {
  console.error ( `no files specified` )
  process.exit ( 1 )
}

function loadFile ( file: string ) {
  if ( !fs.existsSync ( file ) ) {
    console.error ( `file ${file} does not exist` )
    process.exit ( 1 )
  }
  let rawConfig = fs.readFileSync ( file ).toString ( 'utf-8' );
  let dereferenced = derefence ( `Loading file ${file}`, { env: process.env }, rawConfig, { variableDefn: dollarsBracesVarDefn } )

  return JSON.parse ( dereferenced )
}
function processFile ( fileContents: any ) {
  if ( fileContents.jmx ) {
    const jmx = fileContents.jmx
    function get ( name: string, attr: string ) {
      const data = jmx?.[ name ]?.[ attr ]
      if ( !data ) {
        console.log ( `jmx ${name} does not have ${attr}` )
        process.exit ( 1 );
      }
      return data;
    }
    function getArray ( name: string, attr: string ) {
      const data = get ( name, attr )
      if ( !Array.isArray ( data ) ) {
        console.log ( `jmx ${name} ${attr} is not an array` )
        process.exit ( 1 );
      }
      return data;
    }

    const jmxMetrics = flatMapEntries ( jmx, ( _, theType ) => {
      const nameFormat = get ( theType, 'nameFormat' )
      const names = getArray ( theType, 'names' )
      const attributes = getArray ( theType, 'attributes' )
      return flatMap ( names, name => attributes.map ( attribute => {
        let context = `jmx ${theType} ${name} ${attribute}`;
        return ({
          name: context,
          objectName: derefence ( context, { name, attribute, env: process.env }, nameFormat, { variableDefn: bracesVarDefn } ),
          attribute
        });
      } ) );
    } )
    return { jmxMetrics }
  }
  return fileContents
}
