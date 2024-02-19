import { focusOn, identity, Optional } from "@runbook/optics";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/storybook";

import { NameAnd } from "@runbook/utils";
import { StatusEndpointData } from "@runbook/executors";
import { displayExecutors } from "./react.executors";
import { addCmd, newStore, processCmdOnlyForTest, startProcessing } from "@runbook/store";

//exists to just finesse Storybook
const ExecutorStatus = <S extends any> (): JSX.Element => <div></div>;


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ExecutorStatus> = {
  title: 'ExecutorStatus',
  component: ExecutorStatus as any,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForParams>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForParams {
  status: NameAnd<StatusEndpointData>
}
interface TestArgsForParams extends TestStateForParams {
}

const statusL: Optional<TestStateForParams, NameAnd<StatusEndpointData>> =
        focusOn ( identity<TestStateForParams> (), 'status' )


const render: any = ( args: TestArgsForParams ) => {
  return <>
    <DisplayStoryBook s={args} opt={statusL} mode='view'>{displayExecutors<TestStateForParams> ()}</DisplayStoryBook></>
};
export const Executors: Story = {
  render,
  args: {
    status: {
      'id1': {
        finished: false,
        lastUpdated: 0,
        params: {},
        count: 2,
        name: 'some name'
      }
    }
  },
}