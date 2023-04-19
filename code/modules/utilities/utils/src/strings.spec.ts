import { nameValueToNameAndString } from "./strings";

describe ( "nameValueToNameAndString", () => {
  it ( "nameValueToNameAndString", () => {
    expect ( nameValueToNameAndString ( [ "name1:value1", "name2:value2" ] ) ).toEqual ( {
      "name1": "value1",
      "name2": "value2"
    } );
  } );
} );