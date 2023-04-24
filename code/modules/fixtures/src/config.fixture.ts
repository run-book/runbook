import { mereology } from "./mereology.fixture";
import { inheritanceDefn } from "./inheritance.fixture";
import { ref } from "./reference.fixture";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument } from "./instrument.fixture";
import { fixtureView } from "./view.fixture";
import { ScriptInstrument } from "@runbook/scriptinstruments";

export const config = ({
  mereology,
  inheritance: inheritanceDefn,
  reference: ref,
  situation: {
    "leo": {},
    "npx": {},
    "test": {},
    "prod": {}
  },
  instrument: {
    git: gitScriptInstrument as ScriptInstrument,
    ls: lsScriptInstrument as ScriptInstrument,
    echo: echoScriptInstrument as ScriptInstrument
  },
  view: {aView: fixtureView}
})