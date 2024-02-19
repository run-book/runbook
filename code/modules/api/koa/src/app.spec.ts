// index.test.ts
import supertest from 'supertest';

import path from "path";
import { startKoa, stopKoa } from "./app";
import Koa from 'koa';

const root = path.join ( process.cwd (), 'public' );
async function testRaw<T> ( fn: ( app: Koa ) => T ): Promise<any> {
  const koaAndServer = await startKoa ( root, 3011, false );
  try {
    return fn ( koaAndServer.app )
  } finally {
    stopKoa ( koaAndServer );
  }
}
const test = async ( req: string ): Promise<any> =>
  testRaw ( async app => await supertest ( app.callback () ).get ( req ) );
describe ( 'Koa Static Server', () => {
  it ( 'should serve / as index.html', async () => {
    const res = await test ( '/' );
    expect ( res.status ).toBe ( 200 );
    expect ( res.headers[ 'content-type' ] ).toBe ( 'text/html; charset=utf-8' );
    expect ( res.text ).toContain ( '<title>Index</title>' );
  } );

  it ( 'should serve /style.css', async () => {
    const res = await test ( '/style.css' );
    expect ( res.status ).toBe ( 200 );
    expect ( res.headers[ 'content-type' ] ).toBe ( 'text/css; charset=utf-8' );
    expect ( res.text ).toContain ( 'color: red;' );
  } );
  //
  // it ( 'should serve /subdirectory/', async () => {
  //   const res = await test ( '/subdirectory' );
  //   expect ( res.status ).toBe ( 301 );
  //   expect ( res.headers.location ).toBe ( '/subdirectory/' ); // Redirect to the same URL with a trailing slash
  // } );
  it ( 'should not serve /subdirectory - we dont want to expose our directories', async () => {
    const res = await test ( '/subdirectory' );
    expect ( res.status ).toBe ( 404 );
  } );
  it ( 'should not serve /subdirectory/ - we dont want to expose our directories', async () => {
    const res = await test ( '/subdirectory/' );
    expect ( res.status ).toBe ( 404 );
  } );

  it ( 'should serve /subdirectory/file.txt', async () => {
    const res = await test ( '/subdirectory/file.txt' );
    expect ( res.status ).toBe ( 200 );
    expect ( res.headers[ 'content-type' ] ).toBe ( 'text/plain; charset=utf-8' );
    expect ( res.text ).toBe ( 'This is a text file.' );
  } );

  // it ( 'should serve /subdirectory with parent link', async () => {
  //   const res = await testRaw ( async app => await supertest ( app.callback () ).get ( '/subdirectory/' ).redirects ( 0 ) )
  //   expect ( res.status ).toBe ( 200 );
  //   expect ( res.headers[ 'content-type' ] ).toBe ( 'text/html; charset=utf-8' );
  //   expect ( res.text ).toContain ( `<a href="${path.sep}">..</a>` );
  // } );

  it ( 'should serve /unknown/ as 404', async () => {
    const res = await test ( '/unknown' );
    // const res = await supertest ( app.callback () ).get ( '/unknown' );
    expect ( res.status ).toBe ( 404 );
  } );

  it ( 'should serve /subdirectory/unknown as 404', async () => {
    const res = await test ( '/subdirectory/unknown/' );
    expect ( res.status ).toBe ( 404 );
  } );
} );
