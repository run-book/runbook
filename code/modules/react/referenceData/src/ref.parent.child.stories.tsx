import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { ReferenceData } from "@runbook/referencedata";
import { Mereology } from "@runbook/mereology";
import { mereology, ref } from "@runbook/fixtures";
import { displayParentChildReferenceDataTable } from "./ref.react";
import { bc, displayBindingProps } from "./ref.react.fixture";

const RefParentChild = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RefParentChild> = {
  title: 'RefParentChild',
  component: RefParentChild,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {
  ref: ReferenceData,
  mereology: Mereology
  order: string[]
  parent: string
  child: string
}


const renderParentChild = ( args: TestArgsForRefData ) =>
  displayParentChildReferenceDataTable ( args.mereology, args.ref, bc, displayBindingProps ) ( args.order ) ( args.parent, args.child )
export const EnvAndService: Story = {
  render: renderParentChild,
  args: {
    ref,
    mereology: mereology as any,
    order: [],
    parent: "environment",
    child: "service"
  }
}

