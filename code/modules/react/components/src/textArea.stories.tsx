import { focusOn, identity } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/runbook_state";
import React from "react";
import { textarea } from "./textarea";
import { labelAnd } from "./labelAnd";

//exists to just finesse Storybook
const TextArea = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof TextArea> = {
  title: 'TextArea',
  component: TextArea,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};


export default meta;
type Story = StoryObj<TestArgsForTextArea>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForTextArea {
  text: string
}
interface TestArgsForTextArea {
  mode: string
  label: string
  text: string
}


let textL = focusOn ( identity<TestStateForTextArea> (), 'text' )

const render = ( args: TestArgsForTextArea ) => {
  return <DisplayStoryBook s={{ text: args.text }} opt={textL} mode={args.mode}>{labelAnd(args.label,textarea ())}</DisplayStoryBook>
};

export const Text_View: Story = {
  render,
  args: {
    label: "Some label",
    mode: 'view',
    text: "some text goes here"
  },
}
export const Text_Edit: Story = {
  render,
  args: {
    label: "Some label",
    mode: 'edit',
    text: "some text goes here"
  },
}


