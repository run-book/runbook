export function decamelize ( str: string, separator?: string ) {
  separator = typeof separator === 'undefined' ? '_' : separator;

  return str
    .replace ( /([a-z\d])([A-Z])/g, '$1' + separator + '$2' )
    .replace ( /([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2' )
    .toLowerCase ()
    .replace ( /(^\w{1})|(\s+\w{1})/g, l => l.toUpperCase () );
}