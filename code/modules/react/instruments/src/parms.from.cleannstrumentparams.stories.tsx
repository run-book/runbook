import { focusOn, identity, Optional, optionalForRefAndData } from "@runbook/optics";

import { CleanInstrumentParam, CommonInstrument } from "@runbook/instruments";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook, RunbookComponent } from "@runbook/runbook_state";
import React from "react";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument, ScriptInstrument } from "@runbook/scriptinstruments";
import { displayNormalParams, displayParamsFromReference, displayScriptInstrument } from "./instruments.react";
import { NameAnd } from "@runbook/utils";

//exists to just finesse Storybook
const ParamsFromCleanInstrumentParams = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ParamsFromCleanInstrumentParams> = {
  title: 'ParamsFromCleanInstrumentParams',
  component: ParamsFromCleanInstrumentParams,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForParams {
  instrument: NameAnd<CleanInstrumentParam>
  data: NameAnd<string>
}
interface TestArgsForParams {
  instrument: NameAnd<CleanInstrumentParam>
  params: NameAnd<string>
  mode: string
}

const instrumentL: Optional<TestStateForParams, NameAnd<CleanInstrumentParam>> = focusOn ( identity<TestStateForParams> (), 'instrument' )
const dataL: Optional<TestStateForParams, NameAnd<string>> = focusOn ( identity<TestStateForParams> (), 'data' )
const refAndDataL = optionalForRefAndData ( instrumentL, dataL )

const render = ( args: TestArgsForParams ) => {
  return <DisplayStoryBook s={{ instrument: args.instrument, data: args.params }} opt={refAndDataL} mode={args.mode}>{displayParamsFromReference<TestStateForParams> ()}</DisplayStoryBook>
};
const instrument: NameAnd<CleanInstrumentParam> = { a: { default: 'defAValue', description: 'a' }, b: { default: 'defBValue', description: 'b' } }
export const A1B2View: Story = {
  render,
  args: {
    mode: 'view',
    instrument,
    params: { }
  },
}
export const A1B2Edit: Story = {
  render,
  args: {
    mode: 'edit',
    instrument,
    params: { a: '1', b: '2' }
  },
}