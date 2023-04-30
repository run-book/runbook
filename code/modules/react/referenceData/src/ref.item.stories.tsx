import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { ReferenceData } from "@runbook/referencedata";
import { Mereology } from "@runbook/mereology";
import { mereology, ref } from "@runbook/fixtures";
import { displayOneReferenceDataTable } from "./ref.react";
import { bc, displayBindingProps } from "./ref.react.fixture";

const RefItem = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RefItem> = {
  title: 'RefItem',
  component: RefItem,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {
  ref: ReferenceData,
  mereology: Mereology
  order: string[]
  item: string
}


const render = ( args: TestArgsForRefData ) =>
  displayOneReferenceDataTable ( args.mereology, args.ref, bc, displayBindingProps ) ( args.order ) ( args.item )
export const Environment: Story = {
  render,
  args: {
    ref,
    mereology: mereology as any,
    order: [],
    item: "environment",
  }
}

export const Service: Story = {
  render: render,
  args: {
    ref,
    mereology: mereology as any,
    order: [],
    item: "service",
  }
}

