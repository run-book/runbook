// index.ts
import Koa from 'koa';
import http from 'http';
import { chainOfResponsibility } from "@runbook/utils";
import { contextAndStats, ContextAndStats, defaultShowsError, directoryServesDefaultsIfExists, handleFile, KoaPartialFunction, notFoundIs404 } from "./koaPartialFunction";

export interface KoaAndServer {
  app: Koa
  server: http.Server
}

export const defaultHandler = ( ...handlers: KoaPartialFunction[] ): ( from: ContextAndStats, ) => Promise<void> =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    ...handlers,
    handleFile,
    directoryServesDefaultsIfExists,
    notFoundIs404,
  )


export function startKoa ( root: string, port: number, handler?: ( c: ContextAndStats ) => Promise<void> ): Promise<KoaAndServer> {
  const app = new Koa ();
  const realHandler = handler || defaultHandler ();
  app.use ( async ctx => realHandler ( await contextAndStats ( ctx, root ) ) )
  const server = http.createServer ( app.callback () );
  return new Promise<KoaAndServer> ( ( resolve, reject ) => {
    server.listen ( port, () => {
      console.log ( `Server started on http://localhost:${port} with root directory ${root}` )
      resolve ( { app, server } )
    } );
    return { app, server };
  } )
}

export function stopKoa ( { server }: KoaAndServer ) {
  server.close ();
}
