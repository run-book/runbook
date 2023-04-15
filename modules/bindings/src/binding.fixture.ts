import { inheritsFromUsingParents, makeStringDag, StringDag } from "./inheritance";
import { BindingContext } from "./binding";
import { Mereology } from "./mereology";

export const inheritance: StringDag = makeStringDag ( {
  "environment": [ "prod", "dev" ],
  "service": [ "leo" ],
} )
const mereology: Mereology = {
  "environment": {//so this is saying 'in the namespace environment' and thus this is also defining an inheritance
    "dev": {
      leo: { domain: 'dev.leo', port: 80 },
      npx: { domain: 'dev.npx', port: 80 }
    },
    "test": {
      leo: { domain: 'test.leo', port: 80 },
      npx: { domain: 'test.npx', port: 80 }
    }
  },
  service: {
    leo: { git: { url: 'leo.git.url' } },
    npx: { git: { url: 'npx.git.url' } }
  }
}
export const bc: BindingContext = {
  debug: false,
  mereology,
  inheritsFrom: inheritsFromUsingParents ( inheritance.parents )
}
export const situation = {
  prod: { some: "data", leo: { domain: "prodLeo", port: 8080 } },
  test: { some: "data", leo: { domain: "testLeo", port: 8080 } },
  dev: { some: 'otherdata', leo: { domain: 'devLeo', port: 80 } }, "junk": "other"
};
export const s1 = { s: 1, a: 1, b: 2 }
export const s2 = { s: 2, a: 1, b: 2 }
