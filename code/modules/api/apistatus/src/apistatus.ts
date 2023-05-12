import { ContextAndStats, KoaPartialFunction } from "@runbook/koa";
import { NameAnd, Primitive } from "@runbook/utils";

export const response200 = ( body: string ) => async ( from: ContextAndStats ) => {
  from.context.body = body;
  from.context.status = 200;
};
export const matchGet = ( path: string ) => ( from: ContextAndStats ) =>
  from.context.path === path && from.context.method === 'GET';

export function status ( prefix: string, stats: () => NameAnd<Primitive> | undefined ): KoaPartialFunction {
  return {
    isDefinedAt: matchGet ( `${prefix}/status` ),
    apply: response200 ( JSON.stringify ( { status: 'ok', stats: stats () } ) ),
  }
}

export function ping ( prefix: string ): KoaPartialFunction {
  return {
    isDefinedAt: matchGet ( '/api/ping' ),
    apply: response200 ( "Pong" )
  }
}



async ( { ctx, stats } ) => {
  if ( ctx.path === '/api/status' ) {
    ctx.body = { status: 'ok', stats };
    ctx.status = 200;
    return true;
  }
  return false;

}