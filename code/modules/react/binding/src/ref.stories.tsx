import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Binding } from "@runbook/bindings";
import { displayBindings, tableProps } from "./binding.react";
import { ReferenceData } from "@runbook/referencedata";
import { Mereology } from "@runbook/mereology";
import { mereology, ref } from "@runbook/fixtures";

const RefData = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RefData> = {
  title: 'RefData',
  component: RefData,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {
  ref: ReferenceData,
  mereology: Mereology
}


const render = ( args: TestArgsForRefData ) => displayBindings ( tableProps ) ( args.order ) ( args.bindings )
export const Reference: Story = {
  render,
  args: {
    ref,
    mereology
  }
}
