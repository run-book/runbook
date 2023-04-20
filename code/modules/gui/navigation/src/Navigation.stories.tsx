import type { Meta, StoryObj } from '@storybook/react';

import { RunbookState, StateForStoryBook } from '@runbook/utilities_react'
import { HasSelectedPage, selectedPageL } from "./SelectedPage";
import { navigation } from "./Navigation";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<typeof Navigation>;
function Navigation ( args: { st: RunbookState<HasSelectedPage, string>, views: string[] } ): JSX.Element {
  return navigation ( args.st ) ( { views: args.views, page: args.st.get () } )
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render = ( initialS: HasSelectedPage ) => ( args: any ) => {
  return <StateForStoryBook s={initialS} args={args} opt={selectedPageL ()}>
    {args => <Navigation {...args} st={args.st}/>}
  </StateForStoryBook>
};
export const Primary: Story = {
  render: render ( { selectedPage: 'Views' } ),
  args: {
    views: [
      'Views',
      'Instruments',
      'Ontology',
      'Reference Data' ],
  },
}
export const NoSelectedPage: Story = {
  render: render ( { selectedPage: undefined } as any ),
  args: {
    views: [
      'Views',
      'Instruments',
      'Ontology',
      'Reference Data' ],
  },
}


