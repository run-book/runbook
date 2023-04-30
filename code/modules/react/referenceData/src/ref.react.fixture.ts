import { BindingContext } from "@runbook/bindings";
import { inheritance, mereology, ref } from "@runbook/fixtures";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom } from "@runbook/utils";

import { mereologyToSummary } from "@runbook/mereology";
import { DisplayBindingProps, tableProps } from "@runbook/bindings_react";

export const bc: BindingContext = {
  debug: false,
  mereology: mereologyToSummary ( mereology as any ),
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}

export const displayBindingProps: DisplayBindingProps = tableProps