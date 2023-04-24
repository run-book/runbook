import { mereology } from "./mereology.fixture";
import { inheritanceDefn } from "./inheritance.fixture";
import { ref } from "./reference.fixture";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument } from "./instrument.fixture";
import { fixtureView } from "./view.fixture";

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
    git: gitScriptInstrument,
    ls: lsScriptInstrument,
    echo: echoScriptInstrument
  },
  view: {aView: fixtureView}
})