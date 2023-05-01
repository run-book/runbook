import { displayMereology, DisplayMereologyContext, makeConditionToDisplayOneRefData, makeConditionToDisplayParentChildRefData } from "./ref.react";
import { collectObjValues, mapObjToArray, safeObject } from "@runbook/utils";
import { allDataFor } from "@runbook/referencedata";
import { displayMereologyContext } from "./ref.react.fixture";
import { nameSpaceFrom } from "@runbook/mereology";
import { RunbookComponent } from "@runbook/runbook_state";

export interface DisplayOneMereologyRootProps {
  thing: string
}
export const displayOneMereologyRoot = ( context: DisplayMereologyContext ) => ( { thing }: DisplayOneMereologyRootProps ) => {
  const { m, r } = context
  const dispM = displayMereology ( context );
  const DispOne = dispM ( makeConditionToDisplayOneRefData, [] )
  const DispParentChild = dispM ( makeConditionToDisplayParentChildRefData, [] )
  return <div>
    <h1>{thing}</h1>
    <DispOne q={thing}/>
    {mapObjToArray (safeObject( m[ thing ]?.children), ( child, name ) => {
      return <><h2>{thing} -&gt; {name}</h2>
        <DispParentChild q={{ parent: thing, child: name }}/>
      </>
    } )}
  </div>
}

export const displayAllDataFor = ( context: DisplayMereologyContext ) => ( props: DisplayOneMereologyRootProps ) => {
  const { thing } = props
  const nameSpace = nameSpaceFrom ( thing )
  if ( nameSpace === undefined ) return <div>Need something of the form 'name:namespace'. Currently {thing}</div>
  const { m, r } = context
  const forThing = allDataFor ( r ) ( thing )
  console.log ( "ref", r )
  console.log ( "forThing", thing, forThing )
  const newContext = { ...context, r: forThing }
  const inOthers: JSX.Element[] = []
  for ( let parent in m ) {
    for ( let child in safeObject(m[ parent ].children )) {
      if ( child === nameSpace ) {
        inOthers.push ( <>
          <h2>{parent} -&gt; {child}</h2>
          {displayMereology ( newContext ) ( makeConditionToDisplayParentChildRefData, [] ) ( { q: { parent: parent, child: nameSpace } } )}
        </> )
      }
    }

  }
  return <>
    <h1>{thing}</h1>
    {displayOneMereologyRoot ( newContext ) ( { thing: nameSpace } )}
    {inOthers}
  </>
}

export const runbookCompAllDataFor = <S extends any> ( context: DisplayMereologyContext ) => ( path: string[] ): RunbookComponent<S, any> => {
  if ( path.length === 0 ) throw new Error ( `Cannot runbookCompAllDataFor with empty path` )
  const thing = path[ path.length - 1 ]
  return rs => props => displayAllDataFor ( context ) ( { thing } );
}
