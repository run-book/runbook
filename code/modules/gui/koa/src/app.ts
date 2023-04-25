// src/server.ts
import Koa from 'koa';
import fs from 'fs/promises';
import path from 'path';

const app = new Koa();

// Utility function to generate an HTML directory listing
function generateDirectoryListingHTML(dirPath: string, files: string[]): string {
  const fileList = files.map(file => `<li><a href="${path.join(dirPath, file)}">${file}</a></li>`).join('\n');
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Directory listing for ${dirPath}</title>
</head>
<body>
  <h1>Directory listing for ${dirPath}</h1>
  <ul>
    ${fileList}
  </ul>
</body>
</html>
`;
}

// Custom static file serving middleware
async function serveStatic(ctx: Koa.Context, next: Koa.Next): Promise<void> {
  if (ctx.method !== 'GET') {
    return next();
  }

  const filePath = path.join(__dirname, '../../../react/react/build',  ctx.path);

  try {
    const fileStats = await fs.stat(filePath);

    if (fileStats.isDirectory()) {
      const files = await fs.readdir(filePath);
      const indexFile = files.find(file => file.toLowerCase() === 'index.html' || file.toLowerCase() === 'index.htm');
      
      if (indexFile) {
        ctx.type = '.html';
        ctx.body = await fs.readFile(path.join(filePath, indexFile));
      } else {
        ctx.type = '.html';
        ctx.body = generateDirectoryListingHTML(ctx.path, files);
      }
    } else {
      ctx.type = path.extname(filePath);
      ctx.body = await fs.readFile(filePath);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return next();
    }
    throw err;
  }
}

app.use(serveStatic);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
