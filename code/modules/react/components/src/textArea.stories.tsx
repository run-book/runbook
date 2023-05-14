import { focusOn, focusQuery, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import React from "react";

import { labelAnd } from "./labelAnd";
import { textArea, textAreaForObj, TextAreaProps } from "./textarea";

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
  text?: string
  obj?: any
}
interface TestArgsForTextArea extends TestStateForTextArea {
  mode: string
  label: string
  props?: TextAreaProps
}


let textL: Optional<TestStateForTextArea, string> = focusQuery ( identity<TestStateForTextArea> (), 'text' ) as any //TODO fix this
let objL: Optional<TestStateForTextArea, any> = focusQuery ( identity<TestStateForTextArea> (), 'obj' )

const renderTextArea = ( args: TestArgsForTextArea ) => {
  return <DisplayStoryBook s={{ text: args.text }} opt={textL} mode={args.mode}>{labelAnd ( args.label, textArea ( args.props ) )}</DisplayStoryBook>
};
const renderTextAreaAsObj = ( args: TestArgsForTextArea ) => {
  return <DisplayStoryBook s={{ obj: args.obj }} opt={objL} mode={args.mode}>{labelAnd ( args.label, textAreaForObj ( args.props ) )}</DisplayStoryBook>
};

export const TextArea_View: Story = {
  render: renderTextArea,
  args: {
    label: "Text area in view mode",
    mode: 'view',
    text: "some text goes here",
    props: {}
  },
}
export const TextArea_Edit: Story = {
  render: renderTextArea,
  args: {
    label: "Text area in edit mode",
    mode: 'edit',
    text: "some text goes here",
    props: {}
  },
}

export const TextAreaForObj_View: Story = {
  render: renderTextAreaAsObj,
  args: {
    label: "Text area for obj in view mode",
    mode: 'view',
    obj: { a: 1, b: 2 },
    props: { rows: 10 }
  },
}
export const TextAreaForObj_Edit: Story = {
  render: renderTextAreaAsObj,
  args: {
    label: "Text area for obj in edit mode",
    mode: 'edit',
    obj: { a: 1, b: 2 },
    props: { rows: 10 }
  },
}


