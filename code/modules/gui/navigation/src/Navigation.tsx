import { ReactNode } from "react";


interface HasChildren {
  children: ReactNode
}
export function NavItem ( { children }: HasChildren ) {
  return (<li>{children}</li>)
}

export function Navigation (): JSX.Element {
  return <ul>
    <NavItem>Views</NavItem>
    <NavItem>Instruments</NavItem>
    <NavItem>Ontology</NavItem>
    <NavItem>Reference Data</NavItem>
  </ul>
}