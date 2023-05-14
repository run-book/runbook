import { focusOn, identity, LensR, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import React from "react";
import { labelAnd } from "./labelAnd";
import { textInput } from "./textInput";

//exists to just finesse Storybook
const TextInput = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof TextInput> = {
  title: 'TextInput',
  component: TextInput,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};


export default meta;
type Story = StoryObj<TestArgsForTextInput>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForTextInput {
  text: string
}
interface TestArgsForTextInput {
  mode: string
  label: string
  text: string
}


let textL: Optional<TestStateForTextInput, string> = focusOn ( identity<TestStateForTextInput> (), 'text' )

const render = ( args: TestArgsForTextInput ) => {
  return <DisplayStoryBook s={{ text: args.text }} opt={textL as any} mode={args.mode}>{labelAnd ( args.label, textInput ({}) )}</DisplayStoryBook>
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


