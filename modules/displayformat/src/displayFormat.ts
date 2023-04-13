export type DisplayFormat = "json" | "onelinejson" | "oneperlinejson" | "asis" | TableFormat

export interface TableFormat {
  format: "table"
  hideHeader?: boolean | number
  hideFooter?: boolean | number
  headers?: string[]
}
export function isTableFormat ( dop: DisplayFormat ): dop is TableFormat {
  return (dop as any).format === 'table'
}
