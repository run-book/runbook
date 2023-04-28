import { MenuDefnFns, MenuFn, SelectionState } from "./navigation";
import { isOnPath, safeArray, toArray } from "@runbook/utils";
import React from "react";
import { RunbookComponent, RunbookState } from "@runbook/runbook_state";

function onClick<S> ( rs: RunbookState<S, SelectionState>, menuPath: string[], selection: string[] | undefined ) {
  console.log ( 'onClick', menuPath, selection )
  return () => rs.set ( { selection, menuPath } )
}

export function dropdownItem<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string ): RunbookComponent<S, SelectionState> => {
    let id = menuPath.join ( '.' );
    return rs => props =>
      <a id={`${id}.${name}`} onClick={onClick ( rs, menuPath, path )} className="dropdown-item" href="#">{name}</a>;
  };
}

function navBarItemNoChildren<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string ) => {
    return rs => props => <li className="nav-item">
      <a id={menuPath.join ( '.' )} onClick={onClick ( rs, menuPath, path )} className="nav-link">{name}</a></li>
  }
}

function navBarItemChildren<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ) =>
    rs => props => {
      let id = menuPath.join ( '.' );
      let childElements = toArray ( children ).map ( ( c, i ) => c ( rs ) ( props ) );
      const show = isOnPath ( props.focusedOn?.menuPath, menuPath ) ? ' show' : '';
      console.log ( 'navBarItemChildren', 'focused', props, 'menuPath', menuPath, name, show )
      return <li className={`nav-item dropdown${show}`}>
        <a id={id} onClick={onClick ( rs, menuPath, path )} className="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{name}</a>
        <div className={`dropdown-menu${show}`} aria-labelledby={id}>
          {childElements}
        </div>
      </li>
    }
}

function navBarItem<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ): RunbookComponent<S, SelectionState> =>
    children && children.length > 0 ? navBarItemChildren<S> () ( menuPath, path, name, children ) : navBarItemNoChildren<S> () ( menuPath, path, name )
}

function navBar<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ) =>
    rs => props => <nav id={menuPath.join ( '.' )} className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {safeArray ( children ).map ( c => c ( rs ) ( props ) )}
        </ul>
      </div>
    </nav>
}


//  navBar: MenuFn<R>
//   navBarItem: MenuFn<R>,
//   dropDownItem: MenuFn<R>,
//   dropdownMenuItem: MenuFn<R>

export function bootstrapNav<S> (): MenuDefnFns<RunbookComponent<S, SelectionState>> {
  return { navBar: navBar (), navBarItem: navBarItem (), dropdownItem: dropdownItem () }
}
