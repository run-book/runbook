import { focusOn, identity, Optional } from "@runbook/optics";

import { CommonInstrument } from "@runbook/instruments";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook, RunbookComponent } from "@runbook/runbook_state";
import React from "react";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { displayScriptInstrument } from "./instruments.react";
import { ScriptInstrument } from "@runbook/scriptinstruments";

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
}
interface TestArgsForInstrument {
  instrument: ScriptInstrument
  mode: string
}

const instrumentL: Optional<TestStateForInstrument, ScriptInstrument> = focusOn ( identity<TestStateForInstrument> (), 'instrument' )

function scriptInstrument ( mode: string ): RunbookComponent<TestStateForInstrument, ScriptInstrument> {
 return displayScriptInstrument<TestStateForInstrument> ()
}
const render = ( args: TestArgsForInstrument ) => {
  return <DisplayStoryBook s={{ instrument: args.instrument }} opt={instrumentL} mode={args.mode}>{scriptInstrument ( args.mode )}</DisplayStoryBook>
};
export const EchoView: Story = {
  render,
  args: {
    mode: 'view',
    instrument: echoScriptInstrument as ScriptInstrument
  },
}

export const LsEdit: Story = {
  render,
  args: {
    mode: 'edit',
    instrument: lsScriptInstrument as ScriptInstrument
  },
}

export const GitRun: Story = {
  render,
  args: {
    mode: 'run',
    instrument: gitScriptInstrument as ScriptInstrument
  },
}

