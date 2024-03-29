import type { Meta, StoryObj } from '@storybook/react';
import { focusQuery, identity, Optional, optionalForRefAndData } from "@runbook/optics";
import { NameAnd, RefAndData, split } from "@runbook/utils";
import { DisplayStoryBook } from "@runbook/storybook";
import {  RunbookState } from "@runbook/runbook_state";
import { DisplayContext } from "./displayOnDemand";
import { fixtureDisplayContext, fixtureDisplayWithMode, fixtureNavContext, sampleDisplay } from "./display.fixture";
import { displayAndNav, RememberedMode, SelectionState } from "./displayAndNav";


//exists to just finesse Storybook
const DisplayAndNav = (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof DisplayAndNav> = {
  title: 'DisplayAndNav',
  component: DisplayAndNav as any,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

interface DisplayAndNavStoryArgs {
  path: string

  mode?: string
  data: NameAnd<any>
}

interface DisplayAndNavStoryState {
  selectionState: SelectionState
  data: NameAnd<any>
}

export default meta;
type Story = StoryObj<DisplayAndNavStoryArgs>;


// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc
let idOpt = identity<DisplayAndNavStoryState> ();
const selectionOpt: Optional<DisplayAndNavStoryState, any> = focusQuery ( idOpt, 'selectionState' )
const dataOpt: Optional<DisplayAndNavStoryState, NameAnd<any>> = focusQuery ( idOpt, 'data' )
const refAndDataOpt: Optional<DisplayAndNavStoryState, RefAndData<SelectionState, NameAnd<any>>> = optionalForRefAndData ( selectionOpt, dataOpt )

const dc: DisplayContext<DisplayAndNavStoryState> = fixtureDisplayContext<DisplayAndNavStoryState> ( fixtureDisplayWithMode ( selectionOpt ) )
const nc = fixtureNavContext<DisplayAndNavStoryState> ()
const render = ( args: DisplayAndNavStoryArgs ) => {
  const selection = split ( args.path, '.' )

  const rememberedMode: RememberedMode = {}
  rememberedMode[ args.path ] = args.mode as string

  const state: DisplayAndNavStoryState = { data: args.data, selectionState: { selection, rememberedMode } }

  return <DisplayStoryBook s={state} opt={idOpt} mode={args.mode}>
    {st => props => {
      let newSt: RunbookState<DisplayAndNavStoryState, RefAndData<SelectionState, NameAnd<any>>> = st.withOpt ( refAndDataOpt );
      return displayAndNav<DisplayAndNavStoryState> ( nc, dc ) ( newSt ) ( { ...props, focusedOn: newSt.optGet () } );
    }}
  </DisplayStoryBook>
}


export const Views: Story = {
  render: render as any,
  args: {
    path: 'views',
    data: sampleDisplay
  }
}
export const ViewV1InViewMode: Story = {
  render: render as any,
  args: {
    path: 'views.V1',
    mode: 'view',
    data: sampleDisplay
  }
}

export const ViewV2InEditMode: Story = {
  render: render as any,
  args: {
    path: 'views.V2',
    mode: 'edit',
    data: sampleDisplay
  }
}


export const Instruments: Story = {
  render: render as any,
  args: {
    path: 'instruments',
    data: sampleDisplay
  }
}
export const InstrumentI1: Story = {
  render: render as any,
  args: {
    path: 'instruments.I1',
    data: sampleDisplay
  }
}
export const Ontology: Story = {
  render: render as any,
  args: {
    path: 'ontology',
    data: sampleDisplay
  }
}
export const Mereology: Story = {
  render: render as any,
  args: {
    path: 'ontology.mereology',
    data: sampleDisplay
  }
}
export const Reference: Story = {
  render: render as any,
  args: {
    path: 'ontology.reference',
    data: sampleDisplay
  }
}
export const Inheritance: Story = {
  render: render as any,
  args: {
    path: 'ontology.inheritance',
    data: sampleDisplay
  }
}
