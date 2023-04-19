import { NameAnd } from "./nameAnd";

export function safeArray<T> ( t: T[] | undefined ): T[] {
  return t || [];
}
export function safeString(s: string | undefined): string {
  return s || "";
}

export function safeObject<T> ( t: NameAnd<T> | undefined ): NameAnd<T> {
  return t || {};
}

export function toArray<T> ( t: T | T[] | undefined ): T[] {
  return t === undefined ? [] : Array.isArray ( t ) ? t : [ t ];
}