import { display, displayWithNewOpt, RunbookComponent } from "@runbook/runbook_state";
import { evaluateViewConditions, View } from "@runbook/views";
import { labelAnd, Layout, textAreaForObj } from "@runbook/components";
import { Binding, BindingContext } from "@runbook/bindings";
import { focusOnJustB2 } from "@runbook/optics";
import { mapObjToArray, Tuple2 } from "@runbook/utils";

export function displaySituations<S> (): RunbookComponent<S, any> {
  return ( st ) => ( props ) => {
    const { focusedOn } = props;
    return <div>
      {display ( st, props, labelAnd ( 'Situation', textAreaForObj ( { rows: 10 } ) ) )}
    </div>
  };
}


export interface BindingProps {
  names: string[]
  binding: Binding
}
export function BindingRow ( { names, binding }: BindingProps ) {
  return <tr>
    {names.map ( ( name, i ) => <td key={name}>{binding[ name ].value}</td> )}
  </tr>

}
export interface BindingsProps {
  name: string,
  bindings: Binding[]
}
export function BindingTable ( { name, bindings }: BindingsProps ) {
  if ( bindings.length === 0 ) return <><h2>{name}</h2><p>No bindings</p></>
  const binding0 = bindings[ 0 ]
  let names = Object.keys ( binding0 );
  return <>
    <h2>{name}</h2>
    <table>
      <thead>
      <tr>{names.map ( ( name, i ) => <th>{name}</th> )}</tr>
      </thead>
      <tbody>
      {bindings.map ( ( binding, i ) => <BindingRow key={i} names={names} binding={binding}/> )}
      </tbody>
    </table>
  </>
}

export function displayBindings<S> ( name: string, bc: BindingContext ): RunbookComponent<S, Tuple2<View, any>> {
  return ( st ) => ( props ) => {
    const { focusedOn } = props;
    const view = focusedOn?.a
    const situation = focusedOn?.b
    if ( view && situation ) {
      const bindings = evaluateViewConditions ( bc, view ) ( situation )
      return <>{mapObjToArray ( bindings, ( binding, name ) =>
        <BindingTable key={name} name={name} bindings={binding}/> )
      }</>
    } else return <div>Cannot execute</div>
  };
}

export function runView<S> ( name: string, bc: BindingContext ): RunbookComponent<S, Tuple2<View, any>> {
  return ( st ) => ( props ) => {
    return <div>
      <h1>{name}</h1>
      <Layout layout={[ [ 1, 1 ] ]} component='runView'>
        {displayWithNewOpt ( st, props, focusOnJustB2 ( st.opt ), displaySituations () )}
        {display ( st, props, displayBindings ( name, bc ) )}
      </Layout>
    </div>

  }
}