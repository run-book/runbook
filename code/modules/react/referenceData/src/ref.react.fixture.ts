import { BindingContext } from "@runbook/bindings";
import { inheritance, mereology, ref } from "@runbook/fixtures";
import { fromReferenceData } from "@runbook/referencedata";
import { inheritsFrom } from "@runbook/utils";

import { mereologyToSummary } from "@runbook/mereology";
import { DisplayBindingProps, tableProps } from "@runbook/bindings_react";
import { DisplayMereologyContext, DisplayMereologyProps } from "./ref.react";

export const bc: BindingContext = {
  mereology: mereologyToSummary ( mereology as any ),
  refDataFn: fromReferenceData ( ref ),
  inheritsFrom: inheritsFrom ( inheritance )
}

export const displayBindingProps: DisplayBindingProps = tableProps

export const displayMereologyContext: DisplayMereologyContext = {
  bc,
  displayBindingProps,
  r: ref,
  m: mereology as any
}