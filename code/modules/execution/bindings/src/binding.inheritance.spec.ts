import { BindingContext, evaluate } from "./binding";
import { bc } from "./binding.fixture";
import { inheritsFrom, makeStringDag, NameAnd } from "@runbook/utils";

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
  it ( "should bind even if the namespace IS specified: using the condition namespace in the result", () => {
    const situation = { "cat:feline": { "eats": "pigeon:animal" } }
    const condition = { "{eater:animal}": { "eats": "{eaten:animal}" } }
    expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [
      {
        "eaten": { "namespace": "animal", "path": [ "cat:feline", "eats" ], "value": "pigeon" },
        "eater": { "namespace": "animal", "path": [ "cat:feline" ], "value": "cat" }
      } ] )
  } )

  it ( "should bind  if the namespace IS specified and item unknown, using condition namespace in the result", () => {
    const situation = { "tabby:feline": { "eats": "pigeon:animal" } }
    const condition = { "{eater:animal}": { "eats": "{eaten:animal}" } }
    expect ( evaluate ( thisBc, condition ) ( situation ) ).toEqual ( [ {
      "eaten": { "namespace": "animal", "path": [ "tabby:feline", "eats" ], "value": "pigeon" },
      "eater": { "namespace": "animal", "path": [ "tabby:feline" ], "value": "tabby" }
    } ] )
  } )
} )
