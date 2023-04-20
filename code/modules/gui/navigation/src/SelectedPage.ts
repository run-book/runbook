import { focusOn, focusQuery, identity, Optional } from "@runbook/optics";

export const selectedPageL = <S extends HasSelectedPage> (): Optional<S, string> =>
  focusQuery ( identity<any> (), 'selectedPage' );
export interface HasSelectedPage {
  selectedPage: string;
}