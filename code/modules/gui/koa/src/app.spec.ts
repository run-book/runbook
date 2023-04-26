// index.test.ts
import supertest from 'supertest';
import app from './app';

describe('Koa Static Server', () => {
  beforeAll(() => {
    // process.env.ROOT_DIR = './';
  });

  afterAll(() => {
    delete process.env.ROOT_DIR;
  });

  it('should serve /index.html', async () => {
    const res = await supertest(app.callback()).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toContain('<title>Index</title>');
  });

  it('should serve /style.css', async () => {
    const res = await supertest(app.callback()).get('/style.css');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/css; charset=utf-8');
    expect(res.text).toContain('color: red;');
  });

  it('should serve /subdirectory/', async () => {
    const res = await supertest(app.callback()).get('/subdirectory');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/subdirectory/'); // Redirect to the same URL with a trailing slash
  });

  it('should serve /subdirectory/', async () => {
    const res = await supertest(app.callback()).get('/subdirectory/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toContain('<a href="/subdirectory/file.txt">file.txt</a>');
  });

  it('should serve /subdirectory/file.txt', async () => {
    const res = await supertest(app.callback()).get('/subdirectory/file.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text).toBe('This is a text file.');
  });

  it('should serve /subdirectory with parent link', async () => {
    const res = await supertest(app.callback()).get('/subdirectory/').redirects(0);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toContain('<a href=\"/\">..</a>');
  });

  it('should serve /unknown as 404', async () => {
    const res = await supertest(app.callback()).get('/unknown');
    expect(res.status).toBe(404);
  });

  it('should serve /subdirectory/unknown as 404', async () => {
    const res = await supertest(app.callback()).get('/subdirectory/unknown');
    expect(res.status).toBe(404);
  });
});
