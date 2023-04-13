//Copyright (c)2020-2023 Philip Rice. <br />Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the Software), to dealin the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  <br />The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
let pathMarker = /[\/\\]/g;
export function lastSegment ( s: string, marker: string | RegExp = pathMarker ) {
  if ( s === undefined ) return undefined
  const parts = s.split ( marker ).filter(s => s.length> 0)
  if ( parts.length === 0 ) return s
  return parts[ parts.length - 1 ]
}
export function allButLastSegment ( s: string, marker: string | RegExp = pathMarker ): string {
  if ( s === undefined ) return undefined
  const parts = s.split ( marker ).filter(s => s.length> 0)
  if ( parts.length === 0 ) return s
  let result = parts.slice ( 0, -1 ).join ( '/' );
  return result
}
export function firstSegment ( s: string, marker: string | RegExp = pathMarker ) {
  if ( s === undefined ) return undefined
  const parts = s.split ( marker ).filter(s => s.length> 0)
  if ( parts.length === 0 ) return s
  return parts[ 0 ]
}
export function cleanLineEndings ( text: string ) {
  return text.replace ( /((?<!\r)\n|\r(?!\n))/g, '\r\n' )
}
export function toForwardSlash ( s: string ): string {
  return s.replace ( /\\/g, '/' )
}