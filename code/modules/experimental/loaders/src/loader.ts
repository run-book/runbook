import { KleisliWithErrors } from "@runbook/utils";
import { Params } from "./params";

export type Loader<C> = KleisliWithErrors<Params, C>