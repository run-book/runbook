import type { Meta, StoryObj } from '@storybook/react';

import { RunbookState, StateForStoryBook } from '@runbook/utilities_react'
import { navigation, navItem, SelectedAndItems } from "./Navigation";
import { identity } from "@runbook/optics";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};
1


export default meta;
type Story = StoryObj<any>;
function Navigation ( args: { st: RunbookState<SelectedAndItems<any>, SelectedAndItems<any>> } ): JSX.Element {
  return navigation ( navItem ) ( args.st ) ( { focusedOn: args.st.optGet () } )
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render = ( args: SelectedAndItems<any> ) => {
  return <StateForStoryBook s={args} args={{}} opt={identity<SelectedAndItems<any>> ()}>
    {args => <Navigation st={args.st}/>}
  </StateForStoryBook>
};
export const Primary: Story = {
  render: render,
  args: {
    selected: 'views',
    items: {
      views: { 'V1': {}, 'V2': {}, 'V3': {} },
      instruments: { 'I1': {}, 'I2': {}, 'I3': {} },
    }
  }
}
export const NoSelectedPage: Story = {
  render,
  args: {
    items: {
      views: { 'V1': {}, 'V2': {}, 'V3': {} },
      instruments: { 'I1': {}, 'I2': {}, 'I3': {} },
    }
  }
}
export const NoViews: Story = {
  render,
  args: { selected: 'views', },
}


