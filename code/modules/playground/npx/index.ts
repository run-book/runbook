#!/usr/bin/env node

import { defaultHandler, startKoa } from "@runbook/koa";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { ping, status } from "@runbook/apistatus";

const port = process.argv[ 2 ] ? Number.parseInt ( process.argv[ 2 ] ) : 3001

console.log ( 'port', port )
startKoa ( process.cwd (), port, true, defaultHandler (
  status ( '/api', () => ({}) ),
  ping ( "/api" ) ) )
  .then ( () => {
    if ( osType () === 'Windows_NT' ) {
      executeScriptInShell ( process.cwd (), `start http://localhost:${port}/api/status` )
    }
  } )