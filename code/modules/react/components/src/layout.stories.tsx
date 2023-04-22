import { composeOptional, focusOn, identity, LensR, nthItem, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { display, displayChild, DisplayStoryBook, displayWithNewOpt, RunbookState } from "@runbook/runbook_state";
import React from "react";
import { labelAnd } from "./labelAnd";
import { textInput } from "./textInput";
import { Layout, LayoutDefn } from "./layout";

//exists to just finesse Storybook


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Layout> = {
  title: 'Layout',
  component: Layout,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};


export default meta;
type Story = StoryObj<TestArgsForTextInput>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

type TestStateForLayout = string []
interface TestArgsForTextInput {
  mode: string
  label: string
  layout: LayoutDefn
}
function makeTestState ( prefix: string, count: number ): TestStateForLayout {
  return Array.from ( { length: count }, ( _, i ) => prefix + i )
}


const render = ( args: TestArgsForTextInput ) => {
  return <DisplayStoryBook s={makeTestState ( 'text', 12 )} opt={identity<string[]> ()} mode={args.mode}>{
    st => props => <Layout layout={args.layout || []}>
      {[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ].map ( i =>
        displayWithNewOpt<TestStateForLayout, string> ( st, props, composeOptional ( st.opt, nthItem<string> ( i ) ),
          labelAnd<TestStateForLayout, string> ( args.label + i, textInput () ) ) )}</Layout>
  }</DisplayStoryBook>
};

export const Layout2_2: Story = {
  render,
  args: {
    layout: [ [ 2, 2 ], [1], [ 2, 2 ] ],
    label: "Some label",
    mode: 'view'
  },
}
export const Layout3_2_1: Story = {
  render,
  args: {
    layout: [ [ 2, 2, 2 ], [2,2]],
    label: "Some label",
    mode: 'edit',
  },
}


