import { focusOn, focusQuery, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { RunbookComponent } from "@runbook/runbook_state";
import { DisplayStoryBook } from "@runbook/storybook";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { displayScriptInstrument } from "./instruments.react";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { FetchCommand } from "@runbook/commands";

//exists to just finesse Storybook
const Instrument = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Instrument> = {
  title: 'Instrument',
  component: Instrument,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForInstrument>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForInstrument {
  instrument: ScriptInstrument
  fetchCommands: FetchCommand[]
}
interface TestArgsForInstrument {
  name: string
  instrument: ScriptInstrument
  mode: string
}

const instrumentL: Optional<TestStateForInstrument, ScriptInstrument> = focusOn ( identity<TestStateForInstrument> (), 'instrument' )
const fetchCommandOpt: Optional<TestStateForInstrument, FetchCommand[]> = focusQuery ( identity<TestStateForInstrument> (), 'fetchCommands' )
function scriptInstrument ( mode: string, name: string ): RunbookComponent<TestStateForInstrument, ScriptInstrument> {
  return displayScriptInstrument<TestStateForInstrument> ( fetchCommandOpt, name )
}
const render = ( args: TestArgsForInstrument ) => {
  return <DisplayStoryBook s={{ instrument: args.instrument, fetchCommands: [] }} opt={instrumentL} mode={args.mode}>{scriptInstrument ( args.mode, args.name )}</DisplayStoryBook>
};
export const EchoView: Story = {
  render,
  args: {
    name: 'echo',
    mode: 'view',
    instrument: echoScriptInstrument as ScriptInstrument
  },
}

export const LsEdit: Story = {
  render,
  args: {
    name: 'ls',
    mode: 'edit',
    instrument: lsScriptInstrument as ScriptInstrument
  },
}

export const GitRun: Story = {
  render,
  args: {
    name: 'git',
    mode: 'run',
    instrument: gitScriptInstrument as ScriptInstrument
  },
}

