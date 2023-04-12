import { AndCondition, parseCondition, RootCondition } from "@runbook/conditions";
import { BindingContext, evaluateAndCondition, evaluateRootCondition, evaluateRootConditions } from "./bindings";

const bc: BindingContext = {
  inheritance: {
    parents: {
      "prod": [ "environment" ],
      "dev": [ "environment" ],
      "leo": [ "service" ],
    },
    children: {
      "environment": [ "prod", "dev" ],
      "service": [ "leo" ],
    }
  }
}

describe ( "binding", () => {
  let situation = { prod: { some: "data", leo: "data" }, dev: { some: 'otherdata', leo: 'data' }, "junk": "other" };
  describe ( "single node", () => {
    describe ( "simple", () => {
      it ( "should detect 'prod'", () => {
        const condition = parseCondition ( "prod" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
          { conditionIndex: 99, path: [ 'prod' ] }
        ] )
      } )
      it ( "should detect '{env}", () => {
        const condition = parseCondition ( "{env}" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
          { conditionIndex: 99, path: [ 'prod' ] },
          { conditionIndex: 99, path: [ 'dev' ] },
          { conditionIndex: 99, path: [ 'junk' ] },
        ] )
      } )
    } )
    describe ( "inheritance", () => {
      it ( "should detect 'prod:environment'", () => {
        const condition = parseCondition ( "prod:environment" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
          { conditionIndex: 99, path: [ 'prod' ] }
        ] )
      } )
      it ( "should not detect 'junk:environment'", () => {
        const condition = parseCondition ( "junk:environment" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [] )
      } )
      it ( "should detect '{env:environment}", () => {
        const condition = parseCondition ( "{env:environment}" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
          { conditionIndex: 99, path: [ 'prod' ] },
          { conditionIndex: 99, path: [ 'dev' ] },
        ] )
      } )
    } )
    describe ( "<>=", () => {
      const s1 = { s: 1, a: 1, b: 2 }
      const s2 = { s: 2, a: 1, b: 2 }
      it ( "should detect 's=1", () => {
        const condition = parseCondition ( "s=1" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, s1 ) ).toEqual ( [ { conditionIndex: 99, path: [ 's' ] } ] )
        expect ( evaluateRootCondition ( bc, condition, 99, s2 ) ).toEqual ( [] )
      } )
      it ( "should detect '{s}=1", () => {
        const condition = parseCondition ( "{s}=1" ) as RootCondition
        expect ( evaluateRootCondition ( bc, condition, 99, s1 ) ).toEqual ( [
          { conditionIndex: 99, path: [ 's' ] },
          { conditionIndex: 99, path: [ 'a' ] }
        ] )
        expect ( evaluateRootCondition ( bc, condition, 99, s2 ) ).toEqual ( [
          { conditionIndex: 99, path: [ 'a' ] },
        ] )
      } )
    } );
  } )

  describe ( 'multiple nodes', () => {
    it ( 'should detect "prod.leo"', () => {
      const condition = parseCondition ( "prod.leo" ) as RootCondition
      expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
        { conditionIndex: 99, path: [ 'prod', 'leo' ] }
      ] )
    } )
    it ( 'should detect "{env}.{sys}"', () => {
      const condition = parseCondition ( "{env}.{sys}" ) as RootCondition
      //  let situation = { prod: { some: "data", leo: "data" }, dev: { some: 'otherdata', leo: 'data' }, "junk": "other" };
      expect ( evaluateRootCondition ( bc, condition, 99, situation ) ).toEqual ( [
        { conditionIndex: 99, path: [ 'prod', 'some' ] },
        { conditionIndex: 99, path: [ 'prod', 'leo' ] },
        { conditionIndex: 99, path: [ 'dev', 'some' ] },
        { conditionIndex: 99, path: [ 'dev', 'leo' ] },
      ] )
    } )
  } )
  describe ( 'evaluateConditions', () => {
    const c0 = parseCondition ( "{env:environment}.{sys}" ) as RootCondition
    const c1 = parseCondition ( "{env}.{sys:service}" ) as RootCondition
    it ( "should evaluate conditions", () => {
      expect ( evaluateRootConditions ( bc, [ c0, c1 ], situation ) ).toEqual ( [
        { conditionIndex: 0, path: [ 'prod', 'some' ] },
        { conditionIndex: 0, path: [ 'prod', 'leo' ] },
        { conditionIndex: 0, path: [ 'dev', 'some' ] },
        { conditionIndex: 0, path: [ 'dev', 'leo' ] },
        { conditionIndex: 1, path: [ 'prod', 'leo' ] },
        { conditionIndex: 1, path: [ 'dev', 'leo' ] },
      ] )
    } )
  } )

  describe ( "and conditions", () => {
    const c2 = parseCondition ( "{env:environment}.{sys}&{env}.{sys:service}" ) as AndCondition
    const c0 = c2.conditions[ 0 ] as RootCondition
    const c1 = c2.conditions[ 1 ] as RootCondition
    it ( "should evaluate and conditions", () => {
      const rootBindings = evaluateRootConditions ( bc, [ c0, c1 ], situation )
      expect ( evaluateAndCondition ( bc, rootBindings, c2, 2, situation ) ).toEqual ( [
        { conditionIndex: 2, parents: [ 0, 1 ], variables: { env: [ "prod" ], sys: [ "prod", "leo" ] } },
        { conditionIndex: 2, parents: [ 0, 1 ], variables: { env: [ "dev" ], sys: [ "dev", "leo" ] } },

      ] )
    } )


  } )

} )