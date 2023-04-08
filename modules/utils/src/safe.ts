export function safeArray<T> ( t: T[] | undefined ): T[] {
  return t || [];
}

export function toArray<T> ( t: T | T[] | undefined ): T[] {
  return t === undefined ? [] : Array.isArray ( t ) ? t : [ t ];
}