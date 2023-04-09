import { applyOneTransformFn } from "@runbook/optics";
import { notifyErrorListeners, notifyUpdateListeners } from "./listener";
import { checkStore, Store } from "./store";

async function processCmds<State> ( store: Store<State> ): Promise<void> {
  const fullStore = checkStore ( store )
  const cmds = fullStore.queue
  fullStore.queue = []
  if ( cmds.length === 0 ) return
  try {
    fullStore.state = cmds.reduce ( applyOneTransformFn, fullStore.state )
    return await notifyUpdateListeners ( store );
  } catch ( e ) {
    return await notifyErrorListeners ( store, e )
  }
}
/** The infinite loop that processes the cmds */
export function startProcessing ( store: Store<any> ) {
  checkStore ( store ).stop = false
  processing ( store )
}
function processing ( store: Store<any> ) {
  const fullStore = checkStore ( store )
  if ( fullStore.stop ) return;
  let processNext = () => {
    setTimeout ( () => processing ( store ), fullStore.wait );
  };
  processCmds ( store ).then ( processNext, processNext )
}
export function stopProcessing ( store: Store<any> ) {
  checkStore ( store ).stop = true
}