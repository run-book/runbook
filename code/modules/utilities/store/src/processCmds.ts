import { applyOneTransformFn } from "@runbook/optics";
import { notifyErrorListeners, notifyUpdateListeners } from "./listener";
import { checkStore, Store } from "./store";
import { applyMiddleware } from "./middleware";
import { foldWithNotify } from "@runbook/utils";

export const processCmdOnlyForTest = processCmds


async function processCmds<State> ( store: Store<State> ): Promise<void> {
  const fullStore = checkStore ( store )
  const cmds = fullStore.queue
  const middleWare = fullStore.middleWare
  fullStore.queue = []
  if ( cmds.length === 0 ) return
  const onError = async ( c: any, e: any ) => {notifyErrorListeners ( store, e, c )}
  const newStatePreMiddleware: State = await foldWithNotify ( cmds, fullStore.state, applyOneTransformFn, async e => {notifyErrorListeners ( store, e )} );
  const newState: State = await foldWithNotify ( middleWare, newStatePreMiddleware, applyMiddleware ( store, onError ),
    async e => {notifyErrorListeners ( store, e )} );
  fullStore.state = newState
  return notifyUpdateListeners ( store );
}
/** The infinite loop that processes the cmds */
export function startProcessing<S> ( store: Store<S> ) {
  checkStore ( store ).stop = false
  processing ( store )
}
function processing<S> ( store: Store<S> ) {
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