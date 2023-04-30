import { BindingContext } from "@runbook/bindings";
import { inheritance, mereology, ref } from "@runbook/fixtures";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom } from "@runbook/utils";
import { DisplayBindingProps, tableProps } from "@runbook/referencedata_react";
import { mereologyToSummary } from "@runbook/mereology";

export const bc: BindingContext = {
  debug: false,
  mereology: mereologyToSummary ( mereology as any ),
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}

export const displayBindingProps: DisplayBindingProps = tableProps