const express = require('express');
const cors = require('cors');
const config = require('./config');
const llm = require('./llm');
const store = require('./store');
const { review } = require('./review');
const { chat } = require('./chat');
const { progress } = require('./audit');

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

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
  res.status(err.status || 500).json({ error: err.type === 'entity.too.large' ? 'payload too large' : 'internal error' });
});

store.init().finally(() => {
  app.listen(config.port, () => {
    console.log(`[pengu] listening on :${config.port} llm=${llm.enabled() ? config.model : 'stub'} db=${store.kind()}`);
  });
});

module.exports = app;
