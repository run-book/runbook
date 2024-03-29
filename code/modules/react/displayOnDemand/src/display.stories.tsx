import type { Meta, StoryObj } from '@storybook/react';
import { identity } from "@runbook/optics";
import { NameAnd, split } from "@runbook/utils";
import { DisplayStoryBook } from "@runbook/storybook";
import {  RunbookState } from "@runbook/runbook_state";
import { DisplayContext, displayOnDemand } from "./displayOnDemand";
import { fixtureDisplayContext, fixtureDisplayWithoutMode, sampleDisplay } from "./display.fixture";


//exists to just finesse Storybook
const Display = (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Display> = {
  title: 'Display',
  component: Display as any,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

interface DisplayStoryArgs {
  parentPath: string
  item: string
  mode: string
  data: DisplayStoryState
}
type  DisplayStoryState = NameAnd<any>

export default meta;
type Story = StoryObj<DisplayStoryArgs>;

const dc: DisplayContext<DisplayStoryState> = fixtureDisplayContext<DisplayStoryState> ( fixtureDisplayWithoutMode )


// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc

const render: any = ( args: DisplayStoryArgs ) => {
  return <DisplayStoryBook s={args.data} opt={identity<DisplayStoryState> ()} mode={args.mode}>
    {( st: RunbookState<DisplayStoryState, DisplayStoryState> ) => props =>
      displayOnDemand ( dc, split ( args.parentPath, '.' ), args.item ) ( st ) ( props )}
  </DisplayStoryBook>
};


export const Views: Story = {
  render: render,
  args: {
    mode: 'overview',
    parentPath: '',
    item: 'views',
    data: sampleDisplay
  }
}
export const ViewV1: Story = {
  render: render,
  args: {
    parentPath: 'views',
    item: 'V1',
    data: sampleDisplay
  }
}

export const ViewV2_Edit: Story = {
  render: render,
  args: {
    mode: 'edit',
    parentPath: 'views',
    item: 'V2',
    data: sampleDisplay
  }
}

export const InstrumentsUnsupportedDisplay: Story = {
  render: render,
  args: {
    mode: 'overview',
    parentPath: '',
    item: 'instruments',
    data: sampleDisplay
  }
}
export const InstrumentI1View: Story = {
  render: render,
  args: {
    mode: 'view',
    parentPath: 'instruments',
    item: 'I1',
    data: sampleDisplay
  }
}
export const InstrumentI1Run: Story = {
  render: render,
  args: {
    mode: 'run',
    parentPath: 'instruments',
    item: 'I1',
    data: sampleDisplay
  }
}
export const InstrumentI1Edit: Story = {
  render: render,
  args: {
    mode: 'edit',
    parentPath: 'instruments',
    item: 'I1',
    data: sampleDisplay
  }
}
export const InstrumentI1UnsupportedMode: Story = {
  render: render,
  args: {
    mode: 'view',
    parentPath: 'instruments',
    item: 'I1',
    data: sampleDisplay
  }
}
export const Ontology: Story = {
  render: render,
  args: {
    parentPath: '',
    item: 'ontology',
    data: sampleDisplay
  }
}
export const Mereology: Story = {
  render: render,
  args: {
    parentPath: 'ontology',
    item: 'mereology',
    data: sampleDisplay
  }
}
export const Reference: Story = {
  render: render,
  args: {
    parentPath: 'ontology',
    item: 'reference',
    data: sampleDisplay
  }
}
export const Inheritance: Story = {
  render: render,
  args: {
    parentPath: 'ontology',
    item: 'inheritance',
    data: sampleDisplay
  }
}
