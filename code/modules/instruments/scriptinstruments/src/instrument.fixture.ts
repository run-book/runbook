import { SharedScriptInstrument, VaryingScriptInstrument } from "./scriptInstruments";

export const lsScriptInstrument: VaryingScriptInstrument = {
  "type": "script",
  "description": "A demo instrument that displays the directory contents",
  "params": { "dir": { "default": ".", "description": "The directory to display" } },
  "staleness": 5000,
  "cost": "low",
  "format": { "type": "table", "headers": [ "file" ] },
  "windows": {
    "script": "dir /b {dir}",
    "format": { "type": "table", "headers": [ "file" ] }
  },
  "linux": {
    "script": "ls -l {dir}",
    "format": {
      "type": "table", "headers": [ "notdoneyet" ]
    }
  }
}
export const echoScriptInstrument: SharedScriptInstrument = {
  "type": "script",
  "description": "An instrument that sends its arguments to standard output",
  "params": "*",
  "staleness": 5000,
  "cost": "low",
  "script": [ "echo {argsNames}", "echo {allArgs}" ],
  "format": { "type": "table", "hideHeader": 1 }
}

export const gitScriptInstrument: SharedScriptInstrument = {
  "type": "script",
  "description": "This will (when working) go get or update the repo",
  "params": {
    "service": { "description": "The service for the repo", "default": "leo" },
    "repoUrl": { "description": "The url holding the git repo", "default": "leo.git.url" }
  },
  "staleness": 5000,
  "cost": "low",
  "script": [ "echo {argsNames}", "echo {allArgs}" ],
  "format": { "type": "table", "hideHeader": 1 }
}
