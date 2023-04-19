import { NameAnd } from "./nameAnd";
import { isDescendantOfInNameAnd, inheritsFrom, makeStringDag } from "./dag";

const children: NameAnd<string[]> = {
  animal: [ "mammal", "bird", "fish" ],
  mammal: [ "dog", "feline", "horse" ],
  feline: [ "cat", "tiger" ],
  bird: [ "eagle", "pigeon", "sparrow" ],
  fish: [ "salmon", "trout", "bass" ]
}
const inheritance = makeStringDag ( children )
describe ( "dag", () => {
  it ( "isDescendantOfInNameAnd should allow us to say if a child is a descendant of a parent", () => {
    expect ( isDescendantOfInNameAnd ( children ) ( "animal", "dog" ) ).toBe ( true )
    expect ( isDescendantOfInNameAnd ( children ) ( "animal", "cat" ) ).toBe ( true )
    expect ( isDescendantOfInNameAnd ( children ) ( "animal", "animal" ) ).toBe ( true )

    expect ( isDescendantOfInNameAnd ( children ) ( "bob", "bob" ) ).toBe ( true )

    expect ( isDescendantOfInNameAnd ( children ) ( "fish", "animal" ) ).toBe ( false )
    expect ( isDescendantOfInNameAnd ( children ) ( "fish", "dog" ) ).toBe ( false )
  } )
  it ( "isDecendantOfInStringDag should allow us to say if a child is a descendant of a parent", () => {

    expect ( inheritsFrom ( inheritance ) ( "dog", "animal", ) ).toBe ( true )
    expect ( inheritsFrom ( inheritance ) ( "cat", "animal", ) ).toBe ( true )
    expect ( inheritsFrom ( inheritance ) ( "animal", "animal" ) ).toBe ( true )
    expect ( inheritsFrom ( inheritance ) ( "anything", "anything" ) ).toBe ( true )

    expect ( inheritsFrom ( inheritance ) ( "animal", "fish", ) ).toBe ( false )
    expect ( inheritsFrom ( inheritance ) ( "dog", "fish" ) ).toBe ( false )
  } )
  it ( "should respect strict", () => {
    expect ( inheritsFrom ( inheritance, true ) ( "anything", "anything" ) ).toBe ( false )
    expect ( inheritsFrom ( inheritance, true ) ( "animal", "animal" ) ).toBe ( false )

    expect ( inheritsFrom ( inheritance, true ) ( "dog", "animal", ) ).toBe ( true )
    expect ( inheritsFrom ( inheritance, true ) ( "cat", "animal", ) ).toBe ( true )
    expect ( inheritsFrom ( inheritance, true ) ( "animal", "fish", ) ).toBe ( false )
    expect ( inheritsFrom ( inheritance, true ) ( "dog", "fish" ) ).toBe ( false )

  } )
} )

