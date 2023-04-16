import { CleanConfig, validateConfig } from "./config";
import { config } from "@runbook/fixtures";


export const checkConfig: CleanConfig = config
describe ( "validate config", () => {
  it ( "should return no issues with fixture config", () => {
    expect ( validateConfig ( 'prefix' ) ( config ) ).toEqual ( [] )
  } )
  it ( "should report issues with an empty object ", () => {
    expect ( validateConfig ( 'prefix' ) ( {} as any ) ).toEqual ( [
      "prefix.instruments is undefined",
      "prefix.mereology is undefined",
      "prefix.views is undefined",
      "prefix.inheritance is undefined",
      "prefix.reference is undefined",
      "prefix.instruments is undefined"
    ])

  } )
} )