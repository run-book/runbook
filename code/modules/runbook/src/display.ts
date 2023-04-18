import { Command } from "commander";

export function optionToDisplayFormat ( args: any ) {
  if ( args.raw ) return 'raw'
  if ( args.json ) return 'json'
  if ( args.onelinejson ) return 'onelinejson'
  if ( args.oneperlinejson ) return 'oneperlinejson'
  return 'oneperlinejson'
}

export function addDisplayOptions ( c: Command ) {
  return c.option ( '-s|--showCmd', "Show the command instead of executing it" )
    .option ( '-r|--raw', "Show the raw output instead of formatting it" )
    .option ( "-j|--json", "Show the output as json" )
    .option ( "--onelinejson", "Show the output as json" )
    .option ( "-1|--oneperlinejson", "Show the output as json" )
}
