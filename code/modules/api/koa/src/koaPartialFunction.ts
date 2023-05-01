import { PartialFunction } from "@runbook/utils";
import { serveStatic } from "./static";
import path from "path";
import { Stats } from "fs";
import fs from "fs/promises";
import { Context } from "koa";

export const defaultFiles = new Set ( [ 'index.html', 'default.html' ] );
export interface ContextAndStats {
  reqPath: string
  reqPathNoTrailing: string
  context: Context
  stats: Stats
}
export type KoaPartialFunction = PartialFunction<ContextAndStats, Promise<void>>
export const handleFile: KoaPartialFunction = {
  isDefinedAt: ( { stats }: ContextAndStats ) => stats?.isFile (),
  apply: async ( { context, reqPathNoTrailing }: ContextAndStats ) =>
    serveStatic ( context, reqPathNoTrailing )
}
export const notFoundIs404: KoaPartialFunction = {
  isDefinedAt: ( { stats }: ContextAndStats ) => !stats || !(stats.isDirectory () || stats.isFile ()),
  apply: async ( { context }: ContextAndStats ) => {
    context.status = 404;
  }
}
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