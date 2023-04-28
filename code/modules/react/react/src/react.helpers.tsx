export function getElement ( name: string ): HTMLElement {
  let result = document.getElementById ( name );
  if ( result === null ) throw Error ( `Must have an element called ${name}, and can't find it` )
  return result
}