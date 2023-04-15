import { NameAnd } from "@runbook/utils";

const example = {
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
/** the first name is the name of the namespace, the second name is the name of the thing in that namespace,
 * after that we get data for that thing. See mereology.spec.ts for example */
export type Mereology = NameAnd<NameAnd<any>>