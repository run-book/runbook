import { CleanConfig, validateConfig } from "./config";
import { config } from "@runbook/fixtures";


export const castConfig: CleanConfig = config as any
describe ( "validate config", () => {
  it ( "should return no issues with fixture config", () => {
    expect ( validateConfig () ( 'prefix' ) ( castConfig ) ).toEqual ( [] )
  } )
  it ( "should report issues with an empty object ", () => {
    expect ( validateConfig () ( 'prefix' ) ( {} as any ) ).toEqual ( [
      "prefix.instrument is undefined",
      "prefix.mereology is undefined",
      "prefix.view is undefined",
      "prefix.inheritance is undefined",
      "prefix.reference is undefined",
      "prefix.instrument is undefined",
      "prefix.situation is undefined",
    ] )

  } )
  it ( "should report issues with an empty object - allowing partial", () => {
    expect ( validateConfig ( true ) ( 'prefix' ) ( {} as any ) ).toEqual ( [] )
  } )
} )