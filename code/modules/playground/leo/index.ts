#!/usr/bin/env node

import { defaultHandler, startKoa } from "@runbook/api_koa";
import { executeScriptInShell, osType } from "@runbook/scripts";
import { ping, status } from "@runbook/apistatus";

const port = process.argv[ 2 ] ? Number.parseInt ( process.argv[ 2 ] ) : 3001

console.log ( 'port', port , 'args', process.argv)
startKoa ( process.cwd (), port, defaultHandler ( status ( '/api', () => ({}) ), ping ( "/api" ) ) ).then ( () => {
  if ( osType () === 'Windows_NT' ) {
    executeScriptInShell ( process.cwd (), `start http://localhost:${port}/api/status` )
  }
} )