import { focusOn, focusQuery, identity, Optional, optionalForTuple3 } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";
import { gitScriptInstrument, lsScriptInstrument } from "@runbook/fixtures";
import { displayRunForInstrument } from "./instruments.react";
import { NameAnd } from "@runbook/utils";
import { ScriptInstrument } from "@runbook/scriptinstruments";
import { FetchCommand } from "@runbook/commands";
import { StatusEndpointData } from "@runbook/executors";

//exists to just finesse Storybook
const RunInstruments = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RunInstruments> = {
  title: 'RunInstruments',
  component: RunInstruments as any,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

type ScriptIntrumentWithParamAndResult = ScriptInstrument & { paramData?: NameAnd<string>, result?: any }
interface TestStateForParams {
  instrument: ScriptIntrumentWithParamAndResult
  fetchCommands: FetchCommand[]
  target?: any
  status: NameAnd<StatusEndpointData>
}
interface TestArgsForParams {
  instrument: ScriptIntrumentWithParamAndResult
  params: NameAnd<string>
  result: any
  name: string,
  mode: string
}

const instrumentL: Optional<TestStateForParams, ScriptInstrument> = focusOn ( identity<TestStateForParams> (), 'instrument' )
const fetchCommandsL: Optional<TestStateForParams, FetchCommand[]> = focusOn ( identity<TestStateForParams> (), 'fetchCommands' )
const targetL: Optional<TestStateForParams, any> = focusOn ( identity<TestStateForParams> (), 'target' )
const statusL: Optional<TestStateForParams, NameAnd<StatusEndpointData>> = focusQuery ( identity<TestStateForParams> (), 'status' )
const instrumentAndTargetL = optionalForTuple3 ( instrumentL, targetL, statusL )

const render: any = ( args: TestArgsForParams ) => {
  return <DisplayStoryBook s={{ instrument: { ...args.instrument, paramData: args.params, result: args.result }, fetchCommands: [], status: {} }}
                           opt={instrumentAndTargetL} mode={args.mode}>{displayRunForInstrument<TestStateForParams> ( fetchCommandsL, args.name, 'someId', 'target' )}</DisplayStoryBook>
};
export const LS: Story = {
  render,
  args: {
    mode: 'run',
    name: 'ls',
    instrument: lsScriptInstrument as ScriptInstrument,
    params: {}
  },
}
export const Git: Story = {
  render,
  args: {
    mode: 'run',
    name: 'git',
    instrument: gitScriptInstrument as ScriptInstrument,
    params: {
      service: 'some service',
      repoUrl: 'some repo url',
    },
    result: "Loaded"
  },
}
