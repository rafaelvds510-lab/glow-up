import fs from 'fs';
import path from 'path';

const clientDir = path.join(process.cwd(), 'dist', 'client');
const serverDir = path.join(process.cwd(), 'dist', 'server');
const workerDir = path.join(clientDir, '_worker.js');
const workerServerDir = path.join(workerDir, 'server-build');

// Create _worker.js directory
if (!fs.existsSync(workerDir)) {
  fs.mkdirSync(workerDir, { recursive: true });
}

// Move server build inside _worker.js/server-build
if (fs.existsSync(serverDir)) {
  fs.renameSync(serverDir, workerServerDir);
}

// Write the wrapper index.js
const wrapperCode = `
import server from './server-build/index.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Allow Cloudflare Pages to serve static assets like CSS/JS
      let response = await env.ASSETS.fetch(request);
      if (response && response.status >= 200 && response.status < 400) {
        return response;
      }
    } catch (e) {
      // Ignore errors and fallback to SSR
    }
    
    // Fallback to TanStack Start SSR
    return server.fetch(request, env, ctx);
  }
};
`;

fs.writeFileSync(path.join(workerDir, 'index.js'), wrapperCode);

// Delete .wrangler to prevent Cloudflare Pages from being confused
const wranglerDir = path.join(process.cwd(), '.wrangler');
if (fs.existsSync(wranglerDir)) {
  fs.rmSync(wranglerDir, { recursive: true, force: true });
}

console.log("Cloudflare Pages worker generated successfully!");
