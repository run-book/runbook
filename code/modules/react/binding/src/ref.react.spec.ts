import { makeBindingsForRefData } from "./ref.react";
import { inheritance, mereology, ref } from "@runbook/fixtures";
import { BindingContext } from "@runbook/bindings";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom } from "@runbook/utils";

export const bc: BindingContext = {
  debug: false,
  mereology,
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}


describe ( "makeBindingsForRefData", () => {
  it ( "should extract env/services from a reference data", () => {
    expect ( makeBindingsForRefData ( bc, 'environment', 'service', ref ) ).toEqual ( {} )
  } )

} )