import { focusOn, identity, Optional } from "@runbook/optics";

import { CommonInstrument } from "@runbook/instruments";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/utilities_react";
import React from "react";
import { scriptInstrument } from "./instruments.react";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument, ScriptInstrument } from "@runbook/scriptinstruments";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Instrument> = {
  title: 'Instrument',
  component: Instrument,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs

  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestStateForInstrument>;
function Instrument<S extends any> (): JSX.Element {
  return <div></div> //exists to just finesse Storybook
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForInstrument {
  instrument: ScriptInstrument
}

const instrumentL: Optional<TestStateForInstrument, ScriptInstrument> = focusOn ( identity<TestStateForInstrument> (), 'instrument' )
const render =  ( initialS: TestStateForInstrument ) => () => {
  return <DisplayStoryBook s={initialS} opt={instrumentL}>{scriptInstrument ()}</DisplayStoryBook>
};
export const Echo: Story = {
  render: render ( {
    instrument: echoScriptInstrument
  } ),
  args: {},
}

export const Ls: Story = {
  render: render ( {
    instrument: lsScriptInstrument
  } ),
  args: {},
}

export const Git: Story = {
  render: render ( {
    instrument: gitScriptInstrument
  } ),
  args: {},
}

