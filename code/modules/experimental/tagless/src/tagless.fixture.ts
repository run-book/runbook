
import { fromReferenceData, Mereology, ReferenceData } from "@runbook/mereology";
import { inheritsFrom } from "@runbook/utils";
import { inheritance, mereology, ref } from "@runbook/fixtures";
import { BindingContext } from "@runbook/bindings";


export const checkMereology: Mereology = mereology

export const checkRef: ReferenceData = ref

export const bc: BindingContext = {
  debug: false,
  mereology,
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}
export const situation = {
  prod: { some: "data", leo: { domain: "prodLeo", port: 8080 } },
  test: { some: "data", leo: { domain: "testLeo", port: 8080 } },
  dev: { some: 'otherdata', leo: { domain: 'devLeo', port: 80 } }, "junk": "other"
};
export const s1 = { s: 1, a: 1, b: 2 }
export const s2 = { s: 2, a: 1, b: 2 }
