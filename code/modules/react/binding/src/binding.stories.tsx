import { Meta, StoryObj } from "@storybook/react";
import { Binding } from "@runbook/bindings";
import { BindingTable, displayBindings, tableProps } from "./binding.react";
import { ArgsStoryFn } from "@storybook/types";
import { R as ReactRenderer } from "@storybook/react/dist/types-0a347bb9";

//exists to just finesse Storybook


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof BindingTable> = {
  title: 'BindingTable',
  component: BindingTable as any,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export default meta;
type Story = StoryObj<TestArgsForBinding>;
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

interface TestArgsForBinding {
  bindings: Binding[]
  order: string[]
}


const render = ( args: TestArgsForBinding ) => displayBindings ( tableProps ) ( args.order ) ( args.bindings )
export const OneRowTwoCols: Story = {
  render: render as any, // funny gitch when updating versions
  args: {
    order: [],
    bindings: [
      { "env": { "path": [ "prod" ], "value": "prod" }, "ser": { "path": [ "prod", "leo" ], "value": "leo", "namespace": "service" } },
      { "env": { "path": [ "test" ], "value": "test" }, "ser": { "path": [ "test", "leo" ], "value": "leo", "namespace": "service" } },
      { "env": { "path": [ "dev" ], "value": "dev" }, "ser": { "path": [ "dev", "leo" ], "value": "leo", "namespace": "service" } } ]
  }
}

export const OneRow: Story = {
  render : render as any,
  args: {
    order: [ "env" ],
    bindings: [ {
      "domain": { "path": [ "leo", "domain" ], "value": "test.leo" },
      "env": { "namespace": "environment", "path": [ "test" ], "value": "test" },
      "giturl": { "path": [ "leo", "git", "url" ], "value": "leo.git.url" },
      "service": { "path": [ "leo" ], "value": "leo", "namespace": "service" }
    } ]
  }
}
