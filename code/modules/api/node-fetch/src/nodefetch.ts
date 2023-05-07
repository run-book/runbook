import { ProxyAgent } from 'proxy-agent';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch'


const agent = new ProxyAgent ();

export function playbookFetch ( url: RequestInfo, init?: RequestInit ): Promise<Response> {
  const realInit: RequestInit = init ? { agent, ...init } : { agent }
  return fetch ( url, realInit )
}

