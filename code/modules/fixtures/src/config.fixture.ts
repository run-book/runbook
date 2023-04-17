import { mereology } from "./mereology.fixture";
import { inheritance, inheritanceDefn } from "./inheritance.fixture";
import { ref } from "./reference.fixture";

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
  instrument: {},
  view: {}
})