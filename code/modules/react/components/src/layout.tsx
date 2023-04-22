import { RunbookComponent } from "@runbook/runbook_state";
import { toArray } from "@runbook/utils";


export type RowDefn = number | number[]
export type LayoutDefn = RowDefn[]

export interface LayoutProps {
  layout: LayoutDefn
  children: JSX.Element[]
}
export interface LaidOutCell<T> {
  width: number
  children: T[]
}

interface splitUpAcc {
  count: number,
  rows: LaidOutCell<JSX.Element>[]
  thisRow: LaidOutCell<JSX.Element>
}
function canonicalRowDefn ( row: RowDefn ): number[] {
  if ( Array.isArray ( row ) ) return row
  return [ row ]
}
export function canonicalLayoutDefn ( layout: LayoutDefn ): number[][] {
  return layout.map ( canonicalRowDefn )

}
export function splitUpByLayout<T> ( layout: LayoutDefn, children: T[] ): LaidOutCell<T>[][] {
  const canonicalLayout = canonicalLayoutDefn ( layout )
  const result: LaidOutCell<T>[][] = []
  const copy: T[] = [ ...children ].reverse ()
  for ( let row = 0; row < canonicalLayout.length; row++ ) {
    const currentRow = canonicalLayout[ row ]
    const resultRow: LaidOutCell<T>[] = []
    for ( let col = 0; col < currentRow.length; col++ ) {
      const currentCol = currentRow[ col ]
      const resultCell: T[] = []
      for ( let i = 0; i < currentCol; i++ ) {
        const child = copy.pop ()
        if ( child !== undefined ) {
          resultCell.push ( child )
        }
      }
      resultRow.push ( { width: 12 / currentRow.length, children: resultCell } )
    }
    result.push ( resultRow )
  }
  if ( copy.length > 0 ) {
    result.push ( [ { width: 12, children: copy.reverse () } ] )
  }
  return result;
}

export interface LayoutClassNames {
  container: string
  row: string
  col: ( width: number ) => string
}
export const LayoutRaw = ( layoutClass: LayoutClassNames ) => <S extends any> ( props: LayoutProps ): JSX.Element => {
  const { layout, children } = props
  const laidOut = splitUpByLayout ( layout, children )
  return (<div className={layoutClass.container}x-Layout={JSON.stringify(layout)}>
      {laidOut.map ( ( row, i ) => (
        <div className={layoutClass.row} key={i}>
          {row.map ( ( cell, j ) => (
            <div className={layoutClass.col ( cell.width )} key={j}>
              {cell.children}
            </div>
          ) )}
        </div>
      ) )}
    </div>
  )
};
export const Layout = LayoutRaw ( { container: 'container', row: 'row', col: ( width ) => `col` } )