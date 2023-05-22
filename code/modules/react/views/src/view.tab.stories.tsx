import { focusOn, identity, Optional, optionalForRefAndData, optionalForTuple2 } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import { fixtureView } from "@runbook/fixtures";
import { View } from "@runbook/views";
import { bc } from "@runbook/bindings/dist/src/binding.fixture";
import { SelectionState } from "@runbook/menu_react";
import { displayViewTabs } from "./view.tab.react";
import { RefAndData, Tuple2 } from "@runbook/utils";
import { RunbookState } from "@runbook/runbook_state";

//exists to just finesse Storybook
const ViewTabComponent = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ViewTabComponent> = {
  title: 'ViewTabs',
  component: ViewTabComponent,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForView>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForView {
  view: View
  situation: any
  selectionState: SelectionState
}
interface TestArgsForView {
  name: string
  view: View
  situation: any
  selectionState: SelectionState
}

const selectionStateL: Optional<TestStateForView, SelectionState> = focusOn ( identity<TestStateForView> (), 'selectionState' )
const viewL: Optional<TestStateForView, View> = focusOn ( identity<TestStateForView> (), 'view' )
const situationL: Optional<TestStateForView, any> = focusOn ( identity<TestStateForView> (), 'situation' )
const viewAndSituation = optionalForTuple2 ( viewL, situationL )
const selectionStateAndViewAndSituationL: Optional<TestStateForView, RefAndData<SelectionState, Tuple2<View, any>>> =
        optionalForRefAndData ( selectionStateL, viewAndSituation )


const render = ( args: TestArgsForView ) => {
  const mode = ( ss: SelectionState | undefined ) => ss?.rememberedMode?.[ 'menu.path' ] || 'view';
  return <DisplayStoryBook s={{ view: args.view, situation: args.situation, selectionState: args.selectionState }}
                           opt={selectionStateAndViewAndSituationL}
                           mode={mode ( args.selectionState )}>{
    ( st: RunbookState<TestStateForView, RefAndData<SelectionState, Tuple2<View, any>>> ) =>
      props =>
        displayViewTabs<TestStateForView> ( bc ) ( st ) ( { ...props, mode: mode ( st.optGet ()?.ref ) } )}</DisplayStoryBook>
};

const situation = {
  leo: {},
  npx: {},
  test: {},
  prod: {}
}

export const ViewInViewMode: Story = {
  render,
  args: {
    name: 'show data',
    view: fixtureView,
    situation: situation,
    selectionState: {
      menuPath: [ 'menu', 'path' ],
      rememberedMode: {
        'menu.path': 'view'
      }
    }
  },
}

export const ViewInRunMode: Story = {
  render,
  args: {
    name: 'show data',
    view: fixtureView,
    situation: situation,
    selectionState: {
      menuPath: [ 'menu', 'path' ],
      rememberedMode: {
        'menu.path': 'run'
      }
    }
  },
}
