import type { Meta, StoryObj } from '@storybook/react';
import { focusQuery, identity } from "@runbook/optics";
import { NameAnd } from "@runbook/utils";
import { navigation, NavigationContext } from "./navigation";
import React from "react";
import { DisplayStoryBook } from "@runbook/utilities_react";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

//exists to just finesse Storybook
const Navigation = (): JSX.Element => <div></div>;

const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

interface NavigationStoryArgs extends NavigationStoryState {
  data: NameAnd<any>
}
interface NavigationStoryState {
  selected: string[]
}


export default meta;
type Story = StoryObj<NavigationStoryArgs>;

const nc: NavigationContext<NavigationStoryState> = {
  selectionOpt: focusQuery ( identity<NavigationStoryState> (), 'selected' ),
  displayInNav: ( path, t ) => true
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render = ( args: NavigationStoryArgs ) => {
  return <DisplayStoryBook s={{ selected: args.selected }} opt={nc.selectionOpt}>
    {st => props =>
      navigation ( nc ) ( st ) ( { ...props, parentPath: [], parent: args.data } )}
  </DisplayStoryBook>
};
export const Primary: Story = {
  render: render,
  args: {
    selected: [ 'views' ],
    data: {
      instruments: { 'I1': {}, 'I2': {}, 'I3': {} },
      views: { 'V1': {}, 'V2': {}, 'V3': {} },
    }
  }
}
export const NoSelectedPage: Story = {
  render,
  args: {
    data: {
      instruments: { 'I1': {}, 'I2': {}, 'I3': {} },
      views: { 'V1': {}, 'V2': {}, 'V3': {} },
    }
  }
}
export const NoViews: Story = {
  render,
  args: { selected: [ 'views' ] },
}


