import { Meta, StoryObj } from "@storybook/react";
import { displayMereology, makeConditionToDisplayParentChildRefData } from "./ref.react";
import { displayMereologyContext } from "./ref.react.fixture";

const RefParentChild = <S extends any> (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof RefParentChild> = {
  title: 'RefParentChild',
  component: RefParentChild,
};

export default meta;
type Story = StoryObj<TestArgsForRefData>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForRefData {
  order: string[]
  parent: string
  child: string
}


const renderParentChild = ( args: TestArgsForRefData ) => {
  const { parent, child } = args
  return displayMereology ( displayMereologyContext ) ( makeConditionToDisplayParentChildRefData, args.order ) ( { q: { parent, child } } );
}

export const EnvAndService: Story = {
  render: renderParentChild,
  args: {
    order: [],
    parent: "environment",
    child: "service"
  }
}

export const ServiceAndGit: Story = {
  render: renderParentChild,
  args: {
    order: [],
    parent: "service",
    child: "git"
  }
}

