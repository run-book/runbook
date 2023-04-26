// index.ts
import Koa, { Context } from 'koa';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const app = new Koa();
const defaultFiles = new Set(['index.html', 'default.html']);

// Define default content types for the most common file types
const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

async function serveStatic(ctx: Context, filePath: string) {
  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || 'application/octet-stream';
    ctx.type = contentType;
    ctx.body = content;
  } catch (error) {
    ctx.throw(404);
  }
}

app.use(async (ctx) => {
  const { path: reqPath } = ctx.request;
  let rootDir = process.env.ROOT_DIR || 'public';
  let dirPath = path.join(process.cwd(), rootDir, reqPath.replace(/^\//, ''));

  const stats = await fs.stat(dirPath).catch(() => null);

  if (!stats || !stats.isDirectory()) {
    // If the requested path is not a directory, try to serve it as a file.
    const filePath = path.join(process.cwd(), rootDir, reqPath);
    await serveStatic(ctx, filePath);
    return;
  }

  // If there's no trailing slash in the requested path, redirect to the same path with a trailing slash.
  if (!reqPath.endsWith('/')) {
    ctx.status=301;
    ctx.redirect(reqPath + '/');
    return;
  }

  // If the requested path is a directory, try to serve a default file if it exists.
  for (const file of defaultFiles) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath).catch(() => null);
    if (stats && stats.isFile()) {
      await serveStatic(ctx, filePath);
      return;
    }
  }

  // If there's no default file, list the contents of the directory.
  const files = await fs.readdir(dirPath);
  let content = '';

  for (const file of files) {
    let link = `<a href="${reqPath}${file}">${file}</a>`;
    if (defaultFiles.has(file)) {
      link = `<a href="${reqPath}">${file}</a>`;
    }
    content += `<li>${link}</li>`;
  }

  if (reqPath !== '/') {
    const parentDir = path.join(reqPath, '..');
    content = `<li><a href="${parentDir}">..</a></li>` + content;
  }

  ctx.type = 'html';
  ctx.body = `<ul>${content}</ul>`;
});

// Start the server only if this file is run directly (not required as a module)
if (require.main === module) {
  const server = http.createServer(app.callback());
  server.listen(3000, () => {
    console.log(`Server started on http://localhost:3000 with root directory ${process.env.ROOT_DIR || 'public'}`);
  });
}

// function to start app listen on port 3000 also able to cancel

export function start(): http.Server {
  const server = http.createServer(app.callback());
  server.listen(3000, () => {
    console.log(`Server started on http://localhost:3000 with root directory ${process.env.ROOT_DIR || 'public'}`);
  });
  return server;
}

export function stop(server: http.Server) {
  server.close();
}


export default app;
