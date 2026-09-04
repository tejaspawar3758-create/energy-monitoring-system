import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { handleCampusStateRequest, storageKind } from './campusStore.ts';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function viteCampusApiPlugin(): Plugin {
  return {
    name: 'voltwise-campus-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        if (url === '/api/health') {
          const kind = storageKind();
          sendJson(res, 200, {
            ok: true,
            storage: kind,
            isCloudSynced: kind === 'neon',
            isVercel: false,
            message: kind === 'neon'
              ? 'Connected to cloud database (multi-device real-time sync active)'
              : 'Using local file storage. Set DATABASE_URL for cloud sync.',
          });
          return;
        }
        if (url !== '/api/state') {
          next();
          return;
        }

        const method = (req.method || 'GET').toUpperCase();
        let incoming: Record<string, unknown> | undefined;
        if (method === 'PUT' || method === 'POST') {
          try {
            const raw = await readBody(req);
            incoming = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          } catch {
            sendJson(res, 400, { error: 'Invalid JSON body', storage: storageKind() });
            return;
          }
        }
        const result = await handleCampusStateRequest(method, incoming);
        sendJson(res, result.status, result.body);
      });
    },
  };
}
