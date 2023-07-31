#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import { flatMap, mapObjValues } from "@runbook/utils";
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
program.option ( "<file> file", 'the file that holds the data', 'jmx.json' )

const parsed = processProgram ( program, process.argv )
const file = parsed.opts ().file
console.log ( "file", parsed.opts (), file )
if ( !fs.existsSync ( file ) ) {
  console.error ( `file ${file} does not exist` )
  process.exit ( 1 )
}
let rawConfig = fs.readFileSync ( file ).toString ( 'utf-8' );
let dereferenced = derefence ( 'jmxsetup', { env: process.env }, rawConfig, { variableDefn: dollarsBracesVarDefn } )
console.log ( 'dereferenced', dereferenced )
const config = JSON.parse ( dereferenced )
const jmx = config?.jmx
if ( !jmx ) {
  console.error ( `file ${file} does not have a jmx section` )
  process.exit ( 1 )
}
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
const template = config.template || {}
for ( const theType in jmx ) {
  const nameFormat = get ( theType, 'nameFormat' )
  const attributes = getArray ( theType, 'attributes' )
  const names = getArray ( theType, 'names' )

  const jmxMetrics = flatMap ( names, name =>
    attributes.map ( attribute => {
      let context = `jmx ${theType} ${name} ${attribute}`;
      return ({
        name: context,
        objectName: derefence ( context, { name, attribute, env: process.env }, nameFormat, { variableDefn: bracesVarDefn } ),
        attribute
      });
    } ) )
  template.jmxMetrics = jmxMetrics
  console.log ( template )
}

