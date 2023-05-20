import { focusOn, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { NameAnd, RefAndData } from "@runbook/utils";
import { fixtureDisplayWithMode, menuDefn, sampleDisplay } from "./menu.fixture";
import { findMenuAndDisplay, MenuAndDisplayFnsForRunbook, MenuDefnForRunbook, SelectionState } from "./menu";
import { bootStrapCombine, bootstrapMenu } from "./bootstrapMenu";
import { DisplayStoryBook } from "@runbook/storybook";
//exists to just finesse Storybook
const Menu = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Menu> = {
  title: 'Menu',
  component: Menu,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForDisplay>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc


type TestStateForDisplay =TestArgsForDisplay

interface TestArgsForDisplay {
  selection: SelectionState
  data: NameAnd<any>
  status: {executor: NameAnd<string>}
}

type RefAndDataForDisplay = RefAndData<SelectionState, NameAnd<any>>

const selectionL: Optional<TestStateForDisplay, SelectionState> = focusOn ( identity<TestStateForDisplay> (), 'selection' )
const dataL: Optional<TestStateForDisplay, NameAnd<any>> = focusOn ( identity<TestStateForDisplay> (), 'data' )
const refAndDataL: Optional<TestArgsForDisplay, RefAndDataForDisplay>= optionalForRefAndData(selectionL,dataL)

const render = ( args: TestArgsForDisplay ) => {
  const initial: TestStateForDisplay = args
  const menuFns: MenuAndDisplayFnsForRunbook<TestStateForDisplay, any> = bootstrapMenu<TestStateForDisplay, any> ()
  const md: MenuDefnForRunbook<TestStateForDisplay> = menuDefn ( fixtureDisplayWithMode ( selectionL ) )
  return <div><DisplayStoryBook s={initial} opt={refAndDataL} mode='someMode'>{
    findMenuAndDisplay<TestStateForDisplay, any> ( 'nav', menuFns, x => md, bootStrapCombine )}
  </DisplayStoryBook>
    {/*<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossOrigin="anonymous"></script>*/}
    {/*<script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossOrigin="anonymous"></script>*/}
    {/*<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossOrigin="anonymous"></script>*/}

  </div>
};
export const Navbar: Story = {
  render,
  args: {
    selection: {
      selection: [],
      menuPath: [ 'nav', 'Ontology' ]
    },
    data: sampleDisplay,
    status: { executor: {a: "some status" }}
  },
}
