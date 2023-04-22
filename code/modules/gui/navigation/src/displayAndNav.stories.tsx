import type { Meta, StoryObj } from '@storybook/react';
import { focusQuery, identity, Optional } from "@runbook/optics";
import { NameAnd, RefAndData, split } from "@runbook/utils";
import React from "react";
import { DisplayStoryBook, RunbookState } from "@runbook/utilities_react";
import { DisplayContext } from "./displayOnDemand";
import { fixtureDisplayContext, fixtureNavContext, sampleDisplay } from "./display.fixture";
import { displayAndNav, DisplayAndNavReference, RememberedMode } from "./displayAndNav";
import { optionalForRefAndData } from "@runbook/optics/dist/src/refAndData.optics";


//exists to just finesse Storybook
const DisplayAndNav = (): JSX.Element => <div></div>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof DisplayAndNav> = {
  title: 'DisplayAndNav',
  component: DisplayAndNav,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

interface DisplayAndNavStoryArgs {
  path: string
  rememberedMode?: RememberedMode
  mode?: string
  data: NameAnd<any>
}

interface DisplayAndNavStoryState {
  selectionState: DisplayAndNavReference
  data: NameAnd<any>
}

export default meta;
type Story = StoryObj<DisplayAndNavStoryArgs>;


const dc: DisplayContext<DisplayAndNavStoryState> = fixtureDisplayContext ()

const nc = fixtureNavContext<DisplayAndNavStoryState> ()

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduc
const selectionOpt: Optional<DisplayAndNavStoryState, any> = focusQuery ( identity<DisplayAndNavStoryState> (), 'selectionState' )
const dataOpt: Optional<DisplayAndNavStoryState, NameAnd<any>> = focusQuery ( identity<DisplayAndNavStoryState> (), 'data' )
const refOpt: Optional<DisplayAndNavStoryState, RefAndData<DisplayAndNavReference, NameAnd<any>>> = optionalForRefAndData ( selectionOpt, dataOpt )
const render = ( args: DisplayAndNavStoryArgs ) => {
  const selection = split ( args.path, '.' )

  const state: DisplayAndNavStoryState = { data: args.data, selectionState: { selection, rememberedMode: args.rememberedMode } }

  return <DisplayStoryBook s={state} opt={identity<DisplayAndNavStoryState> ()}>
    {st => props => {
      let newSt: RunbookState<DisplayAndNavStoryState, RefAndData<DisplayAndNavReference, NameAnd<any>>> = st.withOpt ( refOpt );
      return displayAndNav<DisplayAndNavStoryState> ( nc, dc ) ( newSt ) ( { focusedOn: newSt.optGet () } );
    }}
  </DisplayStoryBook>
}


export const Views: Story = {
  render: render,
  args: {
    path: 'views',
    data: sampleDisplay
  }
}
export const ViewV1InViewMode: Story = {
  render: render,
  args: {
    path: 'views.v1',
    data: sampleDisplay
  }
}

export const ViewV2InEditMode: Story = {
  render: render,
  args: {
    path: 'views.v2',
    data: sampleDisplay
  }
}


export const Instruments: Story = {
  render: render,
  args: {
    path: 'instruments',
    data: sampleDisplay
  }
}
export const InstrumentI1: Story = {
  render: render,
  args: {
    path: 'instruments.i1',
    data: sampleDisplay
  }
}
export const Ontology: Story = {
  render: render,
  args: {
    path: 'ontology',
    data: sampleDisplay
  }
}
export const Mereology: Story = {
  render: render,
  args: {
    path: 'ontology.mereology',
    data: sampleDisplay
  }
}
export const Reference: Story = {
  render: render,
  args: {
    path: 'ontology.reference',
    data: sampleDisplay
  }
}
export const Inheritance: Story = {
  render: render,
  args: {
    path: 'ontology.inheritance',
    data: sampleDisplay
  }
}
