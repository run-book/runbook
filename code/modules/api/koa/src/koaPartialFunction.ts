import { PartialFunction } from "@runbook/utils";
import { serveStatic } from "./static";
import path from "path";
import { Stats } from "fs";
import fs from "fs/promises";
import { Context } from "koa";

export const defaultFiles = new Set ( [ 'index.html', 'default.html' ] );
export interface ContextAndStats {
  debug: boolean
  reqPath: string
  reqPathNoTrailing: string
  context: Context
  stats: Stats
}
export async function contextAndStats ( context: Context, root: string, debug: boolean ): Promise<ContextAndStats> {
  let reqPath = path.join ( root, context.request.path );
  let reqPathNoTrailing = reqPath.replace ( /\/$/, '' );
  const stats = await fs.stat ( reqPathNoTrailing ).catch ( () => null );
  if ( debug ) console.log ( 'reqPathNoTrailing', reqPathNoTrailing, 'stats', stats, 'isFile:', stats?.isFile (), 'isDirectory:', stats?.isDirectory () );
  return { reqPath, context, stats, reqPathNoTrailing, debug }
}

export type KoaPartialFunction = PartialFunction<ContextAndStats, Promise<void>>
export const handleFile: KoaPartialFunction = {
  isDefinedAt: ( { stats, debug }: ContextAndStats ) => {
    if ( debug ) console.log ( `file ${stats?.isFile ()}` );
    return stats?.isFile ();
  },
  apply: async ( { context, reqPathNoTrailing }: ContextAndStats ) =>
    serveStatic ( context, reqPathNoTrailing )
}
export const notFoundIs404: KoaPartialFunction = {
  isDefinedAt: ( { stats }: ContextAndStats ) => stats === undefined || !stats?.isFile (),
  apply: async ( { context }: ContextAndStats ) => {
    context.status = 404;
  }
}

export const getHandler = ( path: string, content: string, contentType: string ): KoaPartialFunction => {
  return {
    isDefinedAt: ( { context }: ContextAndStats ) => context.request.path === path && context.request.method === 'GET',
    apply: async ( { context }: ContextAndStats ) => {
      context.type = contentType;
      context.body = content;
      context.status = 200;
    }
  }
}

export interface BodyHandlerResult {
  body: string
  contentType: string
  status: number
}
export const postHandler = ( path: string, bodyHandler: ( s: string ) => Promise<BodyHandlerResult> ): KoaPartialFunction => ({
  isDefinedAt: ( { context }: ContextAndStats ) => {
    let b = context.request.path === path && context.request.method === 'POST';
    console.log ( 'postHandler.isDefinedAt', b, context.request.path, path, context.request.method )
    return b;
  },
  apply: async ( { context }: ContextAndStats ) => {
    let s: any = context.request.body;
    console.log ( 'context:', context )
    console.log ( 'initial body: ', s )
    console.log ( 'initial rawBody: ', context.request.rawBody )
    const body = await bodyHandler ( s )
    context.type = body.contentType;
    context.body = body.body;
    context.status = body.status;
  }
});
export const directoryServesDefaultsIfExists: KoaPartialFunction = {
  isDefinedAt: ( { stats }: ContextAndStats ) => stats?.isDirectory (),
  apply: async ( { context, reqPathNoTrailing }: ContextAndStats ) => {
    for ( const file of defaultFiles ) {
      const filePath = path.join ( reqPathNoTrailing, file );
      const stats = await fs.stat ( filePath ).catch ( () => null );
      if ( stats && stats.isFile () ) return await serveStatic ( context, filePath );
    }
  }
}
export const defaultShowsError = async ( { context }: ContextAndStats ): Promise<void> => {
  context.type = 'html';
  context.body = `<h1>Error: Should not see this</h1>`;
}