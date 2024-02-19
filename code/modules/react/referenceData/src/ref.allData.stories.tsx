import { Meta, StoryObj } from "@storybook/react";

import { displayMereologyContext } from "./ref.react.fixture";
import { displayAllDataFor, displayOneMereologyRoot } from "./ref.react.allDataFor";

const AllDataForRoot = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof AllDataForRoot> = {
  title: 'AllDataForRoot',
  component: AllDataForRoot as any,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {
  item: string
}


const renderRoot = ( args: TestArgsForRefData ) =>
  displayOneMereologyRoot ( displayMereologyContext ) ( { thing: args.item } )

const renderFor = ( args: TestArgsForRefData ) =>
  displayAllDataFor ( displayMereologyContext ) ( { thing: args.item } )
export const Environment: Story = {
  render: renderRoot as any,
  args: {
    item: "environment",
  }
}

export const Service: Story = {
  render: renderRoot as any,
  args: {
    item: "service",
  }
}

export const leo: Story = {
  render: renderFor as any,
  args: {
    item: 'leo:service'
  }
}