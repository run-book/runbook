import { MenuAndDisplayFnsForRunbook, MenuFn, onMenuClick, SelectionState, toggleShowDropDown } from "./menu";
import { isOnPath, safeArray, toArray } from "@runbook/utils";
import React from "react";
import { jsonMe, RunbookComponent, RunbookState } from "@runbook/runbook_state";



export function dropdownItem<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string ): RunbookComponent<S, SelectionState> => {
    let id = menuPath.join ( '.' );
    return rs => props =>
      <a id={`${id}.${name}`} onClick={onMenuClick ( rs, menuPath, path )} className="dropdown-item">{name}</a>;
  };
}

function navBarItemNoChildren<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string ) => {
    return rs => props => <li className="nav-item">
      <a id={menuPath.join ( '.' )} onClick={onMenuClick ( rs, menuPath, path )} className="nav-link">{name}</a></li>
  }
}

function navBarItemChildren<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ) =>
    rs => props => {
      let id = menuPath.join ( '.' );
      const showDropDowns = props.focusedOn?.showDropdowns
      let childElements = toArray ( children ).map ( ( c, i ) => c ( rs ) ( props ) );
      let onPath = isOnPath ( props.focusedOn?.menuPath, menuPath );
      const show = showDropDowns && onPath ? ' show' : '';
      const active = onPath ? ' active' : '';
      console.log ( 'navBarItemChildren', 'focused', props, 'menuPath', menuPath, name, show )

      return <li className={`nav-item dropdown${active}${show}`}>
        <a id={id} onClick={toggleShowDropDown ( rs, menuPath )} className="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{name}</a>
        <div className={`dropdown-menu${show}`} aria-labelledby={id}>
          {childElements}
        </div>
      </li>
    }
}

function navBarItem<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ): RunbookComponent<S, SelectionState> =>
    children && children.length > 0
      ? navBarItemChildren<S> () ( menuPath, path, name, children )
      : navBarItemNoChildren<S> () ( menuPath, path, name )
}

function navBar<S> (): MenuFn<RunbookComponent<S, SelectionState>> {
  return ( menuPath: string[], path: string[] | undefined, name: string, children ) =>
    rs => props =>
      <nav id={menuPath.join ( '.' )} className="navbar navbar-expand-lg navbar-light bg-light">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            {safeArray ( children ).map ( c => c ( rs ) ( props ) )}
          </ul>
        </div>
      </nav>
}


export const defaultDisplay = <S extends any> ( path: string[] ): RunbookComponent<S, any> =>
  rs => props => <div id={path.join ( '.' )} className="container-fluid"><h1>Default display for {path.join ( '.' )}</h1>{jsonMe ( rs )}</div>


export const displayNothing = <S extends any> (): RunbookComponent<S, any> =>
  rs => props => <div>Nothing</div>
export function bootstrapMenu<S, Config> (): MenuAndDisplayFnsForRunbook<S, Config> {
  return {
    navBar: navBar (),
    navBarItem: navBarItem (),
    dropdownItem: dropdownItem (),
    defaultDisplay,
    displayNothing: displayNothing ()
  }
}

export function bootStrapCombine ( menu: JSX.Element, display: JSX.Element ) {
  return <div>
    <div>{menu}</div>
    <div>{display}</div>
  </div>


}