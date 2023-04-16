export type DisplayFormat = "json" | "onelinejson" | "oneperlinejson" | "raw" | TableFormat

export interface TableFormat {
  type: "table"
  hideHeader?: boolean | number
  hideFooter?: boolean | number
  headers?: string[]
}
export function isTableFormat ( dop: DisplayFormat ): dop is TableFormat {
  return (dop as any).type === 'table'
}
