'use strict';
// Pengu Watcher: plain CommonJS, zero dependencies. Never throws, fails silently.
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const BACKEND_TIMEOUT_MS = 60000;
const BRIDGE_TIMEOUT_MS = 2000;
const INTERVAL_MS = 10000;
const IDLE_MS = 20000;
const ERROR_DEBOUNCE_MS = 300;
const ERROR_MIN_GAP_MS = 5000;
const MAX_CONTENT = 20000;
const MAX_DIAGS = 20;
const MAX_MSG = 300;
const CONFIG_TTL_MS = 30000;
const RETRY_AFTER_LIMIT_MS = 12000; // backend lets idle through 10 s after the last review
const SKIP_FILES = new Set(['readme.md', '.pengu-course.json']);
const SEVERITY = ['error', 'warning', 'info', 'hint']; // vscode.DiagnosticSeverity 0..3

let out = null;
let courses = []; // [{ courseId, root }]
let states = new Map(); // doc uri string -> per-document state
let cfgCache = { at: 0, value: null };
let warnedNoFetch = false;

function log(msg) {
  try {
    if (out) out.appendLine('[' + new Date().toISOString() + '] ' + msg);
  } catch (e) { /* ignore */ }
}

function readJson(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

function loadConfig() {
  try {
    const now = Date.now();
    if (now - cfgCache.at < CONFIG_TTL_MS) return cfgCache.value;
    const file = path.join(process.env.USERPROFILE || os.homedir(), '.pengu', 'config.json');
    const c = readJson(file);
    let value = null;
    if (c && typeof c.userId === 'string' && typeof c.backendUrl === 'string' && c.userId && c.backendUrl) {
      value = {
        userId: c.userId,
        backendUrl: c.backendUrl.replace(/\/+$/, ''),
        bridgePort: Number(c.bridgePort) || 47821,
        courses: Array.isArray(c.courses) ? c.courses : []
      };
    }
    // Cache successes for the full TTL; retry a missing config after 5 s.
    cfgCache = { at: value ? now : now - CONFIG_TTL_MS + 5000, value };
    return value;
  } catch (e) {
    return null;
  }
}

function norm(p) {
  const r = path.resolve(p);
  return process.platform === 'win32' ? r.toLowerCase() : r;
}

function isInside(root, file) {
  const r = norm(root);
  const f = norm(file);
  return f === r || f.startsWith(r + path.sep);
}

function detectCourses() {
  const found = [];
  try {
    const cfg = loadConfig();
    const folders = vscode.workspace.workspaceFolders || [];
    for (const f of folders) {
      if (f.uri.scheme !== 'file') continue;
      const root = f.uri.fsPath;
      const marker = readJson(path.join(root, '.pengu-course.json'));
      if (marker && typeof marker.courseId === 'string' && marker.courseId) {
        found.push({ courseId: marker.courseId, root });
        continue;
      }
      if (cfg) {
        const m = cfg.courses.find(c => c && c.path && norm(c.path) === norm(root));
        if (m && m.courseId) found.push({ courseId: m.courseId, root });
      }
    }
  } catch (e) {
    log('detectCourses error: ' + e.message);
  }
  courses = found;
  log('courses: ' + (found.map(c => c.courseId + '@' + c.root).join(', ') || 'none'));
}

function courseFor(doc) {
  try {
    if (!doc || doc.uri.scheme !== 'file') return null;
    const fp = doc.uri.fsPath;
    for (const c of courses) {
      if (!isInside(c.root, fp)) continue;
      const rel = path.relative(c.root, fp).split(path.sep).join('/');
      if (!rel || rel.startsWith('..')) continue;
      if (SKIP_FILES.has(path.basename(fp).toLowerCase())) return null;
      return { courseId: c.courseId, filePath: rel };
    }
  } catch (e) { /* ignore */ }
  return null;
}

function sha(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// POST JSON. Uses global fetch when present (VS Code >= 1.82), else node http(s).
function postJson(urlStr, body, timeoutMs) {
  const data = JSON.stringify(body);
  if (typeof fetch === 'function') {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    return fetch(urlStr, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      signal: ac.signal
    })
      .then(async r => {
        let json = null;
        try { json = await r.json(); } catch (e) { /* ignore */ }
        return { ok: r.ok, status: r.status, json };
      })
      .finally(() => clearTimeout(t));
  }
  if (!warnedNoFetch) { warnedNoFetch = true; log('global fetch missing, using node http fallback'); }
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const lib = u.protocol === 'https:' ? require('https') : require('http');
      const req = lib.request(u, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      }, res => {
        let b = '';
        res.setEncoding('utf8');
        res.on('data', c => { b += c; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(b); } catch (e) { /* ignore */ }
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json });
        });
      });
      req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
      req.on('error', reject);
      req.end(data);
    } catch (e) {
      reject(e);
    }
  });
}

// Fire-and-forget event to the Electron bridge (CONTRACT section 2). Never throws.
function bridge(cfg, event) {
  try {
    const p = postJson('http://127.0.0.1:' + cfg.bridgePort + '/event', event, BRIDGE_TIMEOUT_MS);
    p.then(() => {}, () => {}); // swallow failures silently
  } catch (e) { /* ignore */ }
}

function collectDiagnostics(uri) {
  try {
    const list = vscode.languages.getDiagnostics(uri) || [];
    return list
      .map(d => ({
        message: String(d.message || '').slice(0, MAX_MSG),
        severity: SEVERITY[d.severity] || 'info',
        line: (d.range && d.range.start ? d.range.start.line : 0) + 1,
        source: d.source ? String(d.source) : undefined
      }))
      .sort((a, b) => SEVERITY.indexOf(a.severity) - SEVERITY.indexOf(b.severity))
      .slice(0, MAX_DIAGS);
  } catch (e) {
    return [];
  }
}

function errorKeys(diags) {
  return new Set(diags.filter(d => d.severity === 'error').map(d => (d.source || '') + '|' + d.message));
}

function stopTimers(st) {
  try {
    if (st.interval) clearInterval(st.interval);
    if (st.idle) clearTimeout(st.idle);
    if (st.errTimer) clearTimeout(st.errTimer);
    if (st.retry) clearTimeout(st.retry);
  } catch (e) { /* ignore */ }
  st.interval = null;
  st.idle = null;
  st.errTimer = null;
  st.retry = null;
}

async function send(st, trigger) {
  let info = null;
  let cfg = null;
  let started = false; // review_start was sent, so review_result must follow
  try {
    cfg = loadConfig();
    if (!cfg) return;
    const doc = st.doc;
    if (!doc || doc.isClosed) return;
    if (st.inFlight) { st.pending = trigger; return; }
    info = courseFor(doc);
    if (!info) return;

    const content = doc.getText().slice(0, MAX_CONTENT);
    if (!content.trim()) return;
    const hash = sha(content);
    const diagnostics = collectDiagnostics(doc.uri);
    const errSig = Array.from(errorKeys(diagnostics)).sort().join('\n');

    if (trigger === 'error') {
      if (hash === st.lastHash && errSig === st.lastErrSig) return;
      if (Date.now() - st.lastSentAt < ERROR_MIN_GAP_MS) return; // interval will catch it
    } else if (hash === st.lastHash) {
      return;
    }

    st.lastHash = hash;
    st.lastErrSig = errSig;
    st.lastSentAt = Date.now();
    st.inFlight = true;

    const payload = {
      userId: cfg.userId,
      courseId: info.courseId,
      filePath: info.filePath,
      languageId: doc.languageId,
      content,
      diagnostics,
      trigger,
      timestamp: new Date().toISOString()
    };

    bridge(cfg, { type: 'review_start', courseId: info.courseId, filePath: info.filePath });
    started = true;

    log('POST /snapshot ' + info.filePath + ' trigger=' + trigger + ' diags=' + diagnostics.length);
    let result = { question: null, mistakes: [], severity: 'none' };
    try {
      const res = await postJson(cfg.backendUrl + '/snapshot', payload, BACKEND_TIMEOUT_MS);
      if (!res.ok) {
        st.lastHash = null; // allow retry on next tick
        log('snapshot HTTP ' + res.status);
      } else {
        const j = res.json || {};
        result = {
          question: typeof j.question === 'string' && j.question ? j.question : null,
          mistakes: Array.isArray(j.mistakes) ? j.mistakes : [],
          severity: typeof j.severity === 'string' ? j.severity : 'none'
        };
        log('snapshot ok reviewed=' + j.reviewed + ' severity=' + j.severity +
          (j.question ? ' question="' + j.question + '"' : '') + (j.reason ? ' reason=' + j.reason : ''));
        if (j.reviewed === false && j.reason === 'rate_limited') {
          // Not reviewed: forget it was sent and try the latest code again once the server allows it.
          st.lastHash = null;
          if (!st.retry) {
            st.retry = setTimeout(() => { st.retry = null; send(st, 'idle'); }, RETRY_AFTER_LIMIT_MS);
          }
        }
      }
    } catch (e) {
      st.lastHash = null;
      log('snapshot failed: ' + (e && e.message ? e.message : e));
    } finally {
      st.inFlight = false;
      // Always close the review so the pet never stays stuck in "thinking".
      bridge(cfg, {
        type: 'review_result',
        courseId: info.courseId,
        filePath: info.filePath,
        question: result.question,
        mistakes: result.mistakes,
        severity: result.severity
      });
      if (st.pending) {
        const p = st.pending;
        st.pending = null;
        send(st, p);
      }
    }
  } catch (e) {
    try {
      if (st) st.inFlight = false;
      if (started && cfg && info) {
        bridge(cfg, { type: 'review_result', courseId: info.courseId, filePath: info.filePath,
          question: null, mistakes: [], severity: 'none' });
      }
    } catch (e2) { /* ignore */ }
    log('send error: ' + (e && e.message ? e.message : e));
  }
}

function getState(doc) {
  const key = doc.uri.toString();
  let st = states.get(key);
  if (!st) {
    st = {
      doc, interval: null, idle: null, errTimer: null,
      lastHash: null, lastErrSig: '', lastSentAt: 0, retry: null,
      inFlight: false, pending: null, seenErrors: new Set()
    };
    states.set(key, st);
  }
  return st;
}

function onEdit(e) {
  try {
    if (!e || !e.contentChanges || e.contentChanges.length === 0) return;
    if (!courseFor(e.document)) return;
    const st = getState(e.document);
    if (!st.interval) {
      st.interval = setInterval(() => { send(st, 'interval'); }, INTERVAL_MS);
    }
    if (st.idle) clearTimeout(st.idle);
    st.idle = setTimeout(() => {
      if (st.interval) { clearInterval(st.interval); st.interval = null; }
      st.idle = null;
      send(st, 'idle');
    }, IDLE_MS);
  } catch (err) {
    log('onEdit error: ' + err.message);
  }
}

function onDiagnostics(e) {
  try {
    for (const uri of e.uris) {
      const st = states.get(uri.toString());
      if (!st || !st.doc || st.doc.isClosed) continue;
      const keys = errorKeys(collectDiagnostics(uri));
      let hasNew = false;
      for (const k of keys) if (!st.seenErrors.has(k)) { hasNew = true; break; }
      st.seenErrors = keys;
      if (hasNew) {
        if (st.errTimer) clearTimeout(st.errTimer);
        st.errTimer = setTimeout(() => { st.errTimer = null; send(st, 'error'); }, ERROR_DEBOUNCE_MS);
      }
    }
  } catch (err) {
    log('onDiagnostics error: ' + err.message);
  }
}

function onSave(doc) {
  try {
    const info = courseFor(doc);
    if (!info) return;
    const cfg = loadConfig();
    if (!cfg) return;
    bridge(cfg, { type: 'file_saved', courseId: info.courseId, filePath: info.filePath });
    log('file_saved ' + info.filePath);
    // Saving is the natural "check my code" moment: review now instead of waiting for the timers.
    const st = getState(doc);
    stopTimers(st);
    send(st, 'idle');
  } catch (e) {
    log('onSave error: ' + (e && e.message ? e.message : e));
  }
}

function onClose(doc) {
  try {
    const key = doc.uri.toString();
    const st = states.get(key);
    if (st) { stopTimers(st); states.delete(key); }
  } catch (e) { /* ignore */ }
}

function activate(context) {
  try {
    out = vscode.window.createOutputChannel('Pengu');
    context.subscriptions.push(out);
    log('Pengu watcher activating');
    detectCourses();
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(onEdit),
      vscode.workspace.onDidSaveTextDocument(onSave),
      vscode.languages.onDidChangeDiagnostics(onDiagnostics),
      vscode.workspace.onDidCloseTextDocument(onClose),
      vscode.workspace.onDidChangeWorkspaceFolders(() => detectCourses())
    );
  } catch (e) {
    log('activate error: ' + (e && e.message ? e.message : e));
  }
}

function deactivate() {
  try {
    for (const st of states.values()) stopTimers(st);
    states.clear();
  } catch (e) { /* ignore */ }
}

module.exports = { activate, deactivate };
