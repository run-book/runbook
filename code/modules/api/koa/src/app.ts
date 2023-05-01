// index.ts
import Koa, { Context } from 'koa';
import http from 'http';
import { chainOfResponsibility } from "@runbook/utils";
import { ContextAndStats, defaultShowsError, directoryServesDefaultsIfExists, handleFile, notFoundIs404 } from "./koaPartialFunction";
import fs from "fs/promises";
import path from "path";

export interface KoaAndServer {
  app: Koa
  server: http.Server
}

export const defaultHandler: ( from: ContextAndStats ) => Promise<void> =
               chainOfResponsibility ( defaultShowsError, //called if no matches
                 handleFile,
                 directoryServesDefaultsIfExists,
                 notFoundIs404,
               )

export async function contextAndStats ( context: Context, root: string ): Promise<ContextAndStats> {
  let reqPath = path.join ( root, context.request.path );
  let reqPathNoTrailing = reqPath.replace ( /^\//, '' );
  const stats = await fs.stat ( reqPathNoTrailing ).catch ( () => null );
  console.log ( 'reqPathNoTrailing', reqPathNoTrailing, 'stats', stats, 'isFile:', stats?.isFile (), 'isDirectory:', stats?.isDirectory () );
  return { reqPath, context, stats, reqPathNoTrailing }
}

export function startKoa ( root: string, port: number, onStart: () => void, handler?: ( c: ContextAndStats ) => Promise<void> ): KoaAndServer {
  const app = new Koa ();
  const realHandler = handler || defaultHandler;
  app.use ( async ctx => {
    const contextAndStats1 = await contextAndStats ( ctx, root );
    return realHandler ( contextAndStats1 );
  } )
  const server = http.createServer ( app.callback () );
  server.listen ( port, () => {
    console.log ( `Server started on http://localhost:${port} with root directory ${root}` )
    onStart ();
  } );
  return { app, server };
}

export function stopKoa ( { server }: KoaAndServer ) {
  server.close ();
}
