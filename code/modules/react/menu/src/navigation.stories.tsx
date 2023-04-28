import { focusOn, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook, RunbookComponent } from "@runbook/runbook_state";
import { gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { menuDefn, sampleDisplay } from "./navigation.fixture";
import { applyMenuDefn, SelectionState } from "./navigation";
import { bootstrapNav } from "./bootstrapNav";

//exists to just finesse Storybook
const Navigation = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Navigation> = {
  title: 'Navigation',
  component: Navigation,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForNavigation>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc


interface TestStateForNavigation {
  data: NameAnd<any>
  selection: SelectionState

}

interface TestArgsForNavigation extends TestStateForNavigation{
  selection: SelectionState
}

const dataL: Optional<TestStateForNavigation, SelectionState> = focusOn ( identity<TestStateForNavigation> (), 'selection' )


const render = ( args: TestArgsForNavigation ) => {
  return <div><DisplayStoryBook s={args as TestStateForNavigation}
                                opt={dataL} mode='whoCare'>{
    applyMenuDefn<RunbookComponent<TestStateForNavigation, SelectionState>> ( 'nav', bootstrapNav (), menuDefn, sampleDisplay )}
  </DisplayStoryBook>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossOrigin="anonymous"></script>

  </div>
};
export const Navbar: Story = {
  render,
  args: {
    selection: { selection: [], menuPath: ['nav', 'Ontology' ] }
  },
}
