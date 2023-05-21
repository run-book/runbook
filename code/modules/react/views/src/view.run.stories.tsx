import { focusOn, identity, Optional, optionalForTuple } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import { fixtureView } from "@runbook/fixtures";
import { View } from "@runbook/views";
import { runView } from "./view.run.react";
import { bc } from "@runbook/bindings/dist/src/binding.fixture";

//exists to just finesse Storybook
const ViewRunComponent = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ViewRunComponent> = {
  title: 'RunView',
  component: ViewRunComponent,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForView>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForView {
  view: View
  situation: any
}
interface TestArgsForView {
  name: string
  view: View
  mode: string
  situation: any
}

const viewL: Optional<TestStateForView, View> = focusOn ( identity<TestStateForView> (), 'view' )
const situationL: Optional<TestStateForView, any> = focusOn ( identity<TestStateForView> (), 'situation' )
const viewAndSituationL = optionalForTuple ( viewL, situationL )


const render = ( args: TestArgsForView ) => {
  return <DisplayStoryBook s={{ view: args.view, situation: args.situation }} opt={viewAndSituationL} mode={args.mode}>{runView ( args.name, bc )}</DisplayStoryBook>
};

const situation = {
  leo:{},
  npx:{},
  test:{},
  prod:{}
}

export const ViewInViewMode: Story = {
  render,
  args: {
    name: 'show data',
    mode: 'view',
    view: fixtureView,
    situation: situation
  },
}

export const ViewInEditMode: Story = {
  render,
  args: {
    name: 'show data',
    mode: 'edit',
    view: fixtureView,
    situation: situation
  },
}
