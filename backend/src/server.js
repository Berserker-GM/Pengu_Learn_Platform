const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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

const PRODUCT_PRICE = 95000; // INR 950.00, approximately USD 10.
const PRODUCT_CURRENCY = 'INR';
const DOWNLOADS = {
  windows: { file: 'PenguLearn-Setup-v2.4.1.exe', name: 'PenguLearn-Setup-v2.4.1.exe' },
  macos: { file: 'PenguLearn-v2.4.1.dmg', name: 'PenguLearn-v2.4.1.dmg' },
  linux: { file: 'PenguLearn-v2.4.1.AppImage', name: 'PenguLearn-v2.4.1.AppImage' },
};

app.get('/payments/downloads/:platform', (req, res) => {
  const artifact = DOWNLOADS[req.params.platform];
  if (!artifact) return res.status(404).json({ error: 'Unknown platform' });
  const filePath = path.join(__dirname, '..', 'downloads', artifact.file);
  res.json({ available: fs.existsSync(filePath) });
});

app.get('/payments/config', (_req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Razorpay is not configured' });
  }
  res.json({ keyId: process.env.RAZORPAY_KEY_ID, amount: PRODUCT_PRICE, currency: PRODUCT_CURRENCY });
});

app.post('/payments/order', async (_req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Razorpay is not configured' });

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: PRODUCT_PRICE,
        currency: PRODUCT_CURRENCY,
        receipt: `pengu_${crypto.randomUUID().replace(/-/g, '')}`,
        notes: { product: 'Pengu Learn Desktop License' },
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      console.error('[razorpay order]', order);
      return res.status(502).json({ error: 'Could not create a payment order' });
    }
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (err) {
    console.error('[razorpay order]', err);
    res.status(502).json({ error: 'Could not reach Razorpay' });
  }
});

app.post('/payments/verify', async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const { orderId, paymentId, signature } = req.body || {};
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Razorpay is not configured' });
  if (![orderId, paymentId, signature].every((v) => typeof v === 'string' && v.length < 200) ||
      !/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/.test(signature)) {
    return res.status(400).json({ error: 'Invalid payment details' });
  }

  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return res.status(400).json({ error: 'Payment signature did not verify' });
  }

  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    });
    const payment = await response.json();
    if (!response.ok || payment.status !== 'captured' || payment.order_id !== orderId ||
        payment.amount !== PRODUCT_PRICE || payment.currency !== PRODUCT_CURRENCY) {
      return res.status(402).json({ error: 'Payment is not captured or does not match this order' });
    }
    res.json({ verified: true });
  } catch (err) {
    console.error('[razorpay verify]', err);
    res.status(502).json({ error: 'Could not verify payment status' });
  }
});

app.post('/payments/download', async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const { orderId, paymentId, signature, platform } = req.body || {};
  const artifact = DOWNLOADS[platform];
  if (!artifact) return res.status(400).json({ error: 'Unknown platform' });
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Razorpay is not configured' });
  if (![orderId, paymentId, signature].every((v) => typeof v === 'string' && v.length < 200) ||
      !/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/.test(signature)) {
    return res.status(400).json({ error: 'Invalid payment details' });
  }

  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return res.status(403).json({ error: 'Payment signature did not verify' });
  }

  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    });
    const payment = await response.json();
    if (!response.ok || payment.status !== 'captured' || payment.order_id !== orderId ||
        payment.amount !== PRODUCT_PRICE || payment.currency !== PRODUCT_CURRENCY) {
      return res.status(402).json({ error: 'Payment is not captured or does not match this order' });
    }

    const filePath = path.join(__dirname, '..', 'downloads', artifact.file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Installer is not published yet' });
    return res.download(filePath, artifact.name);
  } catch (err) {
    console.error('[razorpay download]', err);
    return res.status(502).json({ error: 'Could not verify payment or deliver the download' });
  }
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
  res.status(err.status || 500).json({ error: err.type === 'entity.too.large' ? 'payload too large' : 'internal error' });
});

store.init().finally(() => {
  app.listen(config.port, () => {
    console.log(`[pengu] listening on :${config.port} llm=${llm.enabled() ? config.model : 'stub'} db=${store.kind()}`);
  });
});

module.exports = app;
