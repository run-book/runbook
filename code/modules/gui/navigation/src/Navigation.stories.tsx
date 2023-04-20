import type { Meta, StoryObj } from '@storybook/react';

import { RunbookState, StateForStoryBook } from '@runbook/utilities_react'
import { navigation, SelectedPageAndViews } from "./Navigation";
import { identity } from "@runbook/optics";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};


export default meta;
type Story = StoryObj<any>;
function Navigation ( args: { st: RunbookState<SelectedPageAndViews, SelectedPageAndViews> } ): JSX.Element {
  return navigation ( args.st ) ( { focusedOn: args.st.optGet () } )
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render = ( args: SelectedPageAndViews ) => {
  return <StateForStoryBook s={args} args={{}} opt={identity<SelectedPageAndViews> ()}>
    {args => <Navigation st={args.st}/>}
  </StateForStoryBook>
};
export const Primary: Story = {
  render: render,
  args: { selectedPage: 'Views', views: [ 'Views', 'Instruments', 'Navigation' ] },
}
export const NoSelectedPage: Story = {
  render,
  args: { views: [ 'Views', 'Instruments', 'Navigation' ] },

}
export const NoViews: Story = {
  render,
  args: {selectedPage: 'Views', },

}


