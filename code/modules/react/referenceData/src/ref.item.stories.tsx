import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { displayMereologyContext } from "./ref.react.fixture";
import { displayMereology, makeConditionToDisplayOneRefData } from "./ref.react";

const RefItem = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RefItem> = {
  title: 'RefItem',
  component: RefItem as any,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {

  order: string[]
  item: string
}


const render : any= ( args: TestArgsForRefData ) =>
  displayMereology ( displayMereologyContext ) ( makeConditionToDisplayOneRefData, args.order ) ( { q: args.item } )
export const Environment: Story = {
  render,
  args: {
    order: [],
    item: "environment",
  }
}

export const Service: Story = {
  render: render,
  args: {
    order: [],
    item: "service",
  }
}

