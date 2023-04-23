import { focusOn, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/runbook_state";
import React from "react";
import { gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { displayRunForInstrument } from "./instruments.react";
import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";

//exists to just finesse Storybook
const RunInstruments = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RunInstruments> = {
  title: 'RunInstruments',
  component: RunInstruments,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

type ScriptIntrumentWithParamAndResult = ScriptInstrument & { paramData?: NameAnd<string>, result?: any }
interface TestStateForParams {
  instrument: ScriptIntrumentWithParamAndResult
}
interface TestArgsForParams {
  instrument: ScriptIntrumentWithParamAndResult
  params: NameAnd<string>
  result: any
  mode: string
}

const instrumentL: Optional<TestStateForParams, ScriptInstrument> = focusOn ( identity<TestStateForParams> (), 'instrument' )


const render = ( args: TestArgsForParams ) => {
  return <DisplayStoryBook s={{ instrument: { ...args.instrument, paramData: args.params, result: args.result } }}
                           opt={instrumentL} mode={args.mode}>{displayRunForInstrument<TestStateForParams> ()}</DisplayStoryBook>
};
export const LS: Story = {
  render,
  args: {
    mode: 'run',
    instrument: lsScriptInstrument as ScriptInstrument,
    params: {}
  },
}
export const Git: Story = {
  render,
  args: {
    mode: 'run',
    instrument: gitScriptInstrument as ScriptInstrument,
    params: {
      service: 'some service',
      repoUrl: 'some repo url',
    },
    result: "Loaded"
  },
}
