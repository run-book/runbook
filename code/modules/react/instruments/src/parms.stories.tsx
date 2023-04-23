import { focusOn, identity, Optional } from "@runbook/optics";

import { CommonInstrument } from "@runbook/instruments";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook, RunbookComponent } from "@runbook/runbook_state";
import React from "react";
import { echoScriptInstrument, gitScriptInstrument, lsScriptInstrument, ScriptInstrument } from "@runbook/scriptinstruments";
import { displayNormalParams, displayScriptInstrument } from "./instruments.react";
import { NameAnd } from "@runbook/utils";

//exists to just finesse Storybook
const Params = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Params> = {
  title: 'Params',
  component: Params,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc


interface TestArgsForParams {
  params: NameAnd<string>
  mode: string
}


const render = ( args: TestArgsForParams ) => {
  return <DisplayStoryBook s={args.params} opt={identity<NameAnd<string>> ()} mode={args.mode}>{displayNormalParams<NameAnd<string>> ()}</DisplayStoryBook>
};
export const A1B2View: Story = {
  render,
  args: {
    mode: 'view',
    params: { a: '1', b: '2' }
  },
}
export const A1B2Edit: Story = {
  render,
  args: {
    mode: 'edit',
    params: { a: '1', b: '2' }
  },
}