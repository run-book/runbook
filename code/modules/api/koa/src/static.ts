// index.ts
import { Context } from 'koa';
import fs from 'fs/promises';
import path from 'path';
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

export async function serveStatic(ctx: Context, filePath: string) {
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
