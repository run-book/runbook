import { BindingContext, evaluate } from "./binding";
import { bc } from "./binding.fixture";
import { isDescendantOfInNameAnd, inheritsFrom, makeStringDag, NameAnd } from "@runbook/utils";

const children: NameAnd<string[]> = {
  animal: [ "mammal", "bird", "fish" ],
  mammal: [ "dog", "feline", "horse" ],
  feline: [ "cat", "tiger" ],
  bird: [ "eagle", "pigeon", "sparrow" ],
  fish: [ "salmon", "trout", "bass" ]
}
const inheritance = makeStringDag ( children )
const thisBc: BindingContext = { ...bc, inheritsFrom: inheritsFrom ( inheritance ) }
describe ( "inheritance", () => {
  it ( "should be able to bind to various animals", () => {
    const situation = { "cat": { "eats": "pigeon" } }
    const condition = { "{eater:animal}": { "eats": "{eaten:animal}" } }
    expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [ {
      "eaten": { "namespace": "animal", "path": [ "cat", "eats" ], "value": "pigeon" },
      "eater": { "namespace": "animal", "path": [ "cat" ], "value": "cat" }
    } ] )
  } )
} )
