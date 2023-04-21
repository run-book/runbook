import { focusOn, identity } from "@runbook/optics";

import { CommonInstrument } from "@runbook/instruments";
import { Meta, StoryObj } from "@storybook/react";
import { DisplayStoryBook } from "@runbook/utilities_react";
import React from "react";
import { instrument } from "./instruments.react";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Instrument> = {
  title: 'Instrument',
  component: Instrument,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs

  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestStateForInstrument<CommonInstrument>>;
function Instrument<S extends any> (): JSX.Element {
  return <div></div> //exists to just finesse Storybook
}
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestStateForInstrument<I extends CommonInstrument> {
  instrument: I
}

const instrumentL = focusOn ( identity<TestStateForInstrument<CommonInstrument>> (), 'instrument' )
const render = <I extends CommonInstrument> ( initialS: TestStateForInstrument<I> ) => () => {
  return <DisplayStoryBook s={initialS} opt={instrumentL}>{instrument}</DisplayStoryBook>
};
export const Unknown: Story = {
  render: render ( {
    instrument: {
      description: 'Some common instrument',
      format: 'json',
      params: '*'
    }
  } ),
  args: {},
}

export const Shared: Story = {
  render: render ( {
    instrument: {
      script: 'some script',
      description: 'Some common instrument',
      format: 'json',
      params: '*'
    }
  } ),
  args: {},
}

export const LinuxAndWindows: Story = {
  render: render ( {
    instrument: {
      windows: {},
      linux: {},
      description: 'Some common instrument',
      format: 'json',
      params: '*'
    }
  } ),
  args: {},
}

