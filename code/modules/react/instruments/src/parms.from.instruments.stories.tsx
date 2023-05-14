import { focusOn, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import { gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { displayParamsFromInstrument } from "./instruments.react";
import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";

//exists to just finesse Storybook
const ParamsFromInstrument = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ParamsFromInstrument> = {
  title: 'ParamsFromInstrument',
  component: ParamsFromInstrument,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForParams {
  instrument: ScriptInstrument
  data: NameAnd<string>
}
interface TestArgsForParams {
  instrument: ScriptInstrument
  params: NameAnd<string>
  mode: string
}

const instrumentL: Optional<TestStateForParams,ScriptInstrument> = focusOn ( identity<TestStateForParams> (), 'instrument' )


const render = ( args: TestArgsForParams ) => {
  return <DisplayStoryBook s={{ instrument: args.instrument, data: args.params }} opt={instrumentL} mode={args.mode}>{displayParamsFromInstrument<TestStateForParams> ()}</DisplayStoryBook>
};
export const LsView: Story = {
  render,
  args: {
    mode: 'view',
    instrument: lsScriptInstrument as ScriptInstrument,
    params: {}
  },
}
export const GitRun: Story = {
  render,
  args: {
    mode: 'run',
    instrument: gitScriptInstrument as ScriptInstrument,
    params: {}
  },
}
