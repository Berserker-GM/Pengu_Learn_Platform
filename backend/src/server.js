const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const llm = require('./llm');
const store = require('./store');
const { review } = require('./review');
const { chat } = require('./chat');
const { progress } = require('./audit');

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const DOWNLOADS = {
  windows: { file: 'PenguLearn-Setup-v2.4.1.exe', name: 'PenguLearn-Setup-v2.4.1.exe' },
  macos: { file: 'PenguLearn-v2.4.1.dmg', name: 'PenguLearn-v2.4.1.dmg' },
  linux: { file: 'PenguLearn-v2.4.1.AppImage', name: 'PenguLearn-v2.4.1.AppImage' },
};

const accessTableUrl = () => `${config.supabaseUrl}/rest/v1/download_access`;
const serviceHeaders = () => ({
  apikey: config.supabaseServiceRoleKey,
  Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  'Content-Type': 'application/json',
});

async function authenticateSupabaseUser(req) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error('Account access is not configured on the server.');
    error.status = 503;
    throw error;
  }
  const token = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    const error = new Error('Sign in with Google to continue.');
    error.status = 401;
    throw error;
  }
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = new Error('Your sign-in expired. Sign in again to continue.');
    error.status = 401;
    throw error;
  }
  return response.json();
}

async function getUserAccess(userId) {
  const query = new URLSearchParams({
    select: 'status,created_at,payment_reference,source',
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    limit: '20',
  });
  const response = await fetch(`${accessTableUrl()}?${query}`, { headers: serviceHeaders() });
  if (!response.ok) throw new Error('Could not check account access.');
  const requests = await response.json();
  return requests.find((request) => request.status === 'approved') || requests[0] || null;
}

app.get('/access/status', async (req, res, next) => {
  try {
    const user = await authenticateSupabaseUser(req);
    res.json({ access: await getUserAccess(user.id) });
  } catch (err) { next(err); }
});

app.post('/access/request', async (req, res, next) => {
  try {
    const user = await authenticateSupabaseUser(req);
    const paymentReference = str(req.body?.paymentReference, 80).trim();
    if (paymentReference.length < 6) return res.status(400).json({ error: 'Enter the UPI transaction reference from your payment app.' });
    const existing = await getUserAccess(user.id);
    if (existing?.status === 'approved') return res.json({ access: existing });
    const response = await fetch(accessTableUrl(), {
      method: 'POST',
      headers: { ...serviceHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: user.id, status: 'pending', payment_reference: paymentReference, source: 'manual_upi' }),
    });
    if (!response.ok) throw new Error('Could not submit the payment for review.');
    res.status(201).json({ access: (await response.json())[0] });
  } catch (err) { next(err); }
});

app.get('/access/downloads/:platform', async (req, res, next) => {
  try {
    const user = await authenticateSupabaseUser(req);
    const access = await getUserAccess(user.id);
    if (access?.status !== 'approved') return res.status(403).json({ error: 'Your account does not have download access yet.' });
    const artifact = DOWNLOADS[req.params.platform];
    if (!artifact) return res.status(404).json({ error: 'Unknown platform' });
    const filePath = path.join(__dirname, '..', 'downloads', artifact.file);
    res.json({ available: fs.existsSync(filePath) });
  } catch (err) { next(err); }
});

app.get('/access/download/:platform', async (req, res, next) => {
  try {
    const user = await authenticateSupabaseUser(req);
    const access = await getUserAccess(user.id);
    if (access?.status !== 'approved') return res.status(403).json({ error: 'Your account does not have download access yet.' });
    const artifact = DOWNLOADS[req.params.platform];
    if (!artifact) return res.status(404).json({ error: 'Unknown platform' });
    const filePath = path.join(__dirname, '..', 'downloads', artifact.file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Installer is not published yet.' });
    return res.download(filePath, artifact.name);
  } catch (err) { next(err); }
});

const TRIGGERS = ['interval', 'idle', 'error'];
const DIAG_SEVERITIES = ['error', 'warning', 'info', 'hint'];
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const validUser = (id) => typeof id === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(id);

app.get('/health', (_req, res) => {
  res.json({ ok: true, version: config.version, llm: llm.enabled() ? 'openrouter' : 'stub', db: store.kind(), llmBudget: llm.budgetStatus() });
});

app.post('/snapshot', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!validUser(b.userId)) return res.status(400).json({ error: 'userId required' });
    if (!b.courseId || !b.filePath || typeof b.content !== 'string') {
      return res.status(400).json({ error: 'courseId, filePath and content are required' });
    }
    const snapshot = {
      userId: b.userId,
      courseId: str(b.courseId, 64),
      filePath: str(b.filePath, 300).replace(/\\/g, '/').replace(/^\/+/, ''),
      languageId: str(b.languageId, 40) || 'plaintext',
      content: str(b.content, 20000),
      trigger: TRIGGERS.includes(b.trigger) ? b.trigger : 'interval',
      timestamp: !isNaN(Date.parse(b.timestamp)) ? new Date(b.timestamp).toISOString() : new Date().toISOString(),
      diagnostics: (Array.isArray(b.diagnostics) ? b.diagnostics : []).slice(0, 20).map((d) => ({
        message: str(d?.message, 300),
        severity: DIAG_SEVERITIES.includes(d?.severity) ? d.severity : 'error',
        line: Number.isInteger(d?.line) ? d.line : 0,
        source: str(d?.source, 40),
      })),
    };
    const out = await review(snapshot);
    console.log(`[snapshot] ${snapshot.userId.slice(0, 8)} ${snapshot.courseId}/${snapshot.filePath} ${snapshot.trigger} -> ${out.reviewed ? out.severity : out.reason}`);
    res.json(out);
  } catch (err) {
    next(err);
  }
});

app.post('/chat', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!validUser(b.userId)) return res.status(400).json({ error: 'userId required' });
    const message = str(b.message, 500).trim();
    if (!message) return res.status(400).json({ error: 'message required' });
    res.json(await chat({ userId: b.userId, message, courseId: str(b.courseId, 64) || null }));
  } catch (err) {
    next(err);
  }
});

app.get('/progress/:userId', async (req, res, next) => {
  try {
    if (!validUser(req.params.userId)) return res.status(400).json({ error: 'bad userId' });
    res.json(await progress(req.params.userId));
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  const message = err.type === 'entity.too.large' ? 'payload too large' : (status < 500 && err.message ? err.message : 'internal error');
  res.status(status).json({ error: message });
});

store.init().finally(() => {
  app.listen(config.port, () => {
    console.log(`[pengu] listening on :${config.port} llm=${llm.enabled() ? config.model : 'stub'} db=${store.kind()}`);
  });
});

module.exports = app;
