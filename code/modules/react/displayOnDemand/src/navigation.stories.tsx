import type { Meta, StoryObj } from '@storybook/react';
import { NameAnd } from "@runbook/utils";
import { navigation } from "./navigation";
import { DisplayStoryBook } from "@runbook/storybook";
import { fixtureNavContext, sampleDisplay } from "./display.fixture";
import { focusQuery, identity } from "@runbook/optics";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

//exists to just finesse Storybook
const Navigation = (): JSX.Element => <div></div>;

const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation as any,
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


// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const nc = fixtureNavContext<NavigationStoryState> ()
const selectionOpt = focusQuery ( identity<NavigationStoryState> (), 'selected' )
const render: any = ( args: NavigationStoryArgs ) => {
  return <DisplayStoryBook s={{ selected: args.selected }} opt={selectionOpt} mode={undefined}>
    {st => props =>
      navigation ( nc ) ( st ) ( { ...props, parentPath: [], parent: args.data } )}
  </DisplayStoryBook>
};
export const Primary: Story = {
  render: render,
  args: {
    selected: [ 'views' ],
    data: sampleDisplay
  }
}
export const NoSelectedPage: Story = {
  render,
  args: {
    data: sampleDisplay
  }
}
export const NoViews: Story = {
  render,
  args: { selected: [ 'views' ] },
}


