import { focusOn, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import { fixtureView } from "@runbook/fixtures";
import { View } from "@runbook/views";
import { displayView } from "./view.react";

//exists to just finesse Storybook
const ViewComponent = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ViewComponent> = {
  title: 'View',
  component: ViewComponent,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForView>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForView {
  view: View
}
interface TestArgsForView {
  name: string
  view: View
  mode: string
}

const viewL: Optional<TestStateForView, View> = focusOn ( identity<TestStateForView> (), 'view' )


const render = ( args: TestArgsForView ) => {
  return <DisplayStoryBook s={{ view: args.view }} opt={viewL} mode={args.mode}>{displayView ( args.name )}</DisplayStoryBook>
};
export const ViewInViewMode: Story = {
  render,
  args: {
    name: 'show data',
    mode: 'view',
    view: fixtureView
  },
}

export const ViewInEditMode: Story = {
  render,
  args: {
    name: 'show data',
    mode: 'edit',
    view: fixtureView
  },
}
