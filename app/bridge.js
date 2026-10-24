const http = require('http');

const MAX_BODY = 256 * 1024;

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// CONTRACT §2: the VS Code extension posts review events to 127.0.0.1:<bridgePort>.
function startBridge(port, onEvent) {
  const server = http.createServer((req, res) => {
    const url = (req.url || '').split('?')[0];
    if (req.method === 'GET' && url === '/ping') return reply(res, 200, { ok: true, app: 'pengu' });
    if (req.method !== 'POST' || url !== '/event') return reply(res, 404, { error: 'not found' });

    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reply(res, 413, { error: 'body too large' });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (res.writableEnded) return;
      let event;
      try {
        event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (err) {
        return reply(res, 400, { error: 'invalid JSON' });
      }
      if (!event || typeof event.type !== 'string') return reply(res, 400, { error: 'type required' });
      reply(res, 200, { ok: true });
      try {
        onEvent(event);
      } catch (err) {
        console.error('Bridge event failed:', err);
      }
    });
  });
  server.on('error', (err) => console.error(`Bridge could not listen on 127.0.0.1:${port}:`, err.message));
  server.listen(port, '127.0.0.1');
  return server;
}

module.exports = { startBridge };
