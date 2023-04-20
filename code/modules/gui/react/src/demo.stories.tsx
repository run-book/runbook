import type { Meta, StoryObj } from '@storybook/react';

import { RunbookState, StateForStoryBook } from '@runbook/utilities_react'
import { identity } from "@runbook/optics";
import { demo, DemoType } from "./demo";
import { NameAnd } from "@runbook/utils";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Demo> = {
  title: 'Demo',
  component: Demo,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};


export default meta;
type Story = StoryObj<any>;
function Demo ( args: { st: RunbookState<DemoType, DemoType> } ): JSX.Element {
  return demo ( args.st ) ( { focusedOn: args.st.optGet () } )
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render = ( args: DemoType ) => {
  return <StateForStoryBook s={args} args={{}} opt={identity<DemoType> ()}>
    {args => <Demo st={args.st}/>}
  </StateForStoryBook>
};
export const Primary: Story = {
  render: render,
  args: {
    views: { v1: { name: "View 1" }, v2: { name: "View 2" }, v3: { name: "View 3" } },
    instruments: { i1: { name: "Instrument 1" }, i2: { name: "Instrument 2" }, i3: { name: "Instrument 3" } },
  }
}
