import { SelectionState } from "./displayAndNav";

const defaultView = 'view'
export function getMode(ref:  SelectionState|undefined )  {
  if ( ref === undefined ) return defaultView;
  const { rememberedMode, selection } = ref;
  const path = selection.join ( '.' );
  const mode = rememberedMode?.[ path ];
  return mode ?? defaultView;
}