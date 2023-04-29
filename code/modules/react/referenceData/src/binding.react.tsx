import { unique } from "@runbook/utils";
import { Binding, PathAndValue } from "@runbook/bindings";

export interface DisplayBindingProps {
  noContent: JSX.Element
  displayBinding: ( name: string, value: PathAndValue ) => JSX.Element
  headerRow: ( names: string[] ) => JSX.Element
  rows: ( elements: JSX.Element[], row: number ) => JSX.Element
  cols: ( header: JSX.Element, elements: JSX.Element[] ) => JSX.Element
}

export const displayOneBinding = ( props: DisplayBindingProps, order: string[] ) => ( b: Binding, row: number ): JSX.Element =>
  props.rows ( order.map ( name => props.displayBinding ( name, b[ name ] ) ), row )

export const displayBindings = ( props: DisplayBindingProps ) => ( order: string[] ) => ( bs: Binding[] ): JSX.Element => {
  if ( bs.length === 0 ) return props.noContent
  const keys = Object.keys ( bs[ 0 ] );
  const realOrder = order.length === 0 ? keys : unique ( [ ...order, ...keys ] )
  const rows = bs.map ( displayOneBinding ( props, realOrder ) );
  const header = props.headerRow ( realOrder )
  return props.cols ( header, rows )
};

export const tableProps: DisplayBindingProps = {
  noContent: <div>No Content</div>,
  headerRow: ( names ) => <tr>{names.map ( name => <th key={name}>{name}</th> )}</tr>,
  cols: ( header: JSX.Element, elements ) => <table className="table table-bordered">
    <thead>{header}</thead>
    <tbody>{elements}</tbody>
  </table>,
  rows: ( elements, row ) => <tr key={row}>{elements}</tr>,
  displayBinding: ( name, value ) => <td key={name}>{name}: {value.value}</td>
}

export const BindingTable = displayBindings ( tableProps ) ( [] )


