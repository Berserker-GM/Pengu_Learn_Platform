const { app, BrowserWindow, ipcMain, powerMonitor, screen, shell } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { startBridge } = require('./bridge');
const courses = require('./courses');

// Pet pages live in app/pet and animation frames in app/assets (CONTRACT §5 file:// URLs).
app.commandLine.appendSwitch('allow-file-access-from-files');

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PET_SIZE = 260;
const ANIMATIONS_DIR = path.join(__dirname, 'assets', 'animations');
const FRAME_FILE = /\.(png|gif|webp|jpe?g|svg)$/i;

// CONTRACT §6 defaults; a state folder's config.json overrides them.
const STATE_DEFAULTS = {
  hello: { loop: false, next: 'idle' },
  idle: { loop: true, next: 'idle' },
  walk: { loop: true, next: 'idle' },
  dragged: { loop: true, next: 'idle' },
  hover_jump: { loop: false, next: 'idle' },
  thinking: { loop: true, next: 'idle' },
  sending: { loop: false, next: 'thinking' },
  talking: { loop: true, next: 'idle' },
  sleeping: { loop: true, next: 'idle' },
};

let petWindow = null;
let dashWindow = null;
let dragOffset = null;
let settings = null; // { userId, backendUrl, bridgePort }
let lastCourseId = null; // course of the latest bridge event, gives /chat context

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
}

function loadDefaults() {
  const raw = readJson(path.join(__dirname, 'config.default.json')) || {};
  const port = Number(raw.bridgePort);
  return {
    backendUrl: typeof raw.backendUrl === 'string' && raw.backendUrl ? raw.backendUrl : 'http://localhost:8787',
    bridgePort: Number.isInteger(port) && port > 0 && port < 65536 ? port : 47821,
  };
}

function ensureUserId() {
  const filePath = path.join(app.getPath('userData'), 'user.json');
  const existing = readJson(filePath);
  if (existing && typeof existing.userId === 'string' && UUID_V4.test(existing.userId)) {
    return existing.userId;
  }
  const userId = crypto.randomUUID();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ userId }, null, 2), 'utf8');
  return userId;
}

function sharedConfigPath() {
  const home = process.env.USERPROFILE || app.getPath('home');
  return path.join(home, '.pengu', 'config.json');
}

function keptCourses(existing) {
  if (!existing || !Array.isArray(existing.courses)) return [];
  return existing.courses
    .filter((course) => course && typeof course.courseId === 'string' && typeof course.path === 'string')
    .map((course) => ({ courseId: course.courseId, path: course.path }));
}

function writeSharedConfig(userId, defaults) {
  const filePath = sharedConfigPath();
  const config = {
    userId,
    backendUrl: defaults.backendUrl,
    bridgePort: defaults.bridgePort,
    courses: keptCourses(readJson(filePath)),
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
  return filePath;
}

// The extension falls back to config.courses[].path when a folder has no marker (CONTRACT §3).
function rememberCourse(courseId, coursePath) {
  const filePath = sharedConfigPath();
  const config = readJson(filePath) || {};
  const kept = keptCourses(config).filter((course) => course.courseId !== courseId);
  config.courses = kept.concat({ courseId, path: coursePath });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}

function createPetWindow() {
  const win = new BrowserWindow({
    width: PET_SIZE,
    height: PET_SIZE,
    transparent: true,
    frame: false,
    thickFrame: false,
    hasShadow: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    roundedCorners: false,
    title: 'Pengu',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const area = screen.getPrimaryDisplay().workArea;
  win.setBounds({
    x: Math.round(area.x + area.width - PET_SIZE - 24),
    y: Math.round(area.y + area.height - PET_SIZE - 24),
    width: PET_SIZE,
    height: PET_SIZE,
  });
  win.setAlwaysOnTop(true, 'floating');
  win.loadFile(path.join(__dirname, 'pet', 'index.html'));
  win.on('closed', () => {
    petWindow = null;
  });
  return win;
}

function createDashboardWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 640,
    minHeight: 480,
    title: 'Pengu',
    backgroundColor: '#f6f7fb',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, 'dashboard', 'index.html'));
  win.on('closed', () => {
    dashWindow = null;
  });
  return win;
}

function openDashboard() {
  if (dashWindow && !dashWindow.isDestroyed()) {
    if (dashWindow.isMinimized()) dashWindow.restore();
    dashWindow.show();
    dashWindow.focus();
    return;
  }
  dashWindow = createDashboardWindow();
}

function sendToPet(channel, payload) {
  if (petWindow && !petWindow.isDestroyed()) petWindow.webContents.send(channel, payload);
}

function sendToDashboard(channel, payload) {
  if (dashWindow && !dashWindow.isDestroyed()) dashWindow.webContents.send(channel, payload);
}

// Backend calls never throw: failures come back as { error } (CONTRACT §1 clients ignore errors).
async function backendFetch(urlPath, options, timeoutMs) {
  try {
    const res = await fetch(settings.backendUrl.replace(/\/+$/, '') + urlPath, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { error: (body && body.error) || `Backend returned ${res.status}` };
    return body || { error: 'Empty response from backend' };
  } catch (err) {
    return { error: err && err.name === 'TimeoutError' ? 'Backend timed out' : 'Backend is not reachable' };
  }
}

function pushProgress(courseId) {
  const course = courses.findCourse(app, courseId);
  if (!course) return;
  sendToDashboard('dash:progress-updated', { courseId, progress: courses.courseProgress(app, course) });
}

function handleBridgeEvent(event) {
  if (event.type === 'review_start') {
    sendToPet('pet:state', { state: 'thinking', reason: 'review_start' });
  } else if (event.type === 'review_result') {
    sendToPet('pet:state', { state: 'idle', reason: 'review_result' });
    if (typeof event.question === 'string' && event.question.trim()) {
      sendToPet('pet:say', { text: event.question, kind: 'review' });
    }
  }
  if (typeof event.courseId === 'string') {
    lastCourseId = event.courseId;
    pushProgress(event.courseId);
  }
}

function listAnimations() {
  const states = {};
  let names = [];
  try {
    names = fs.readdirSync(ANIMATIONS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch (err) {
    return { states };
  }
  for (const name of names) {
    const dir = path.join(ANIMATIONS_DIR, name);
    let frames = [];
    try {
      frames = fs.readdirSync(dir).filter((f) => FRAME_FILE.test(f)).sort();
    } catch (err) {
      continue;
    }
    if (!frames.length) continue;
    const defaults = STATE_DEFAULTS[name] || { loop: true, next: 'idle' };
    const custom = readJson(path.join(dir, 'config.json')) || {};
    const fps = Number(custom.fps);
    states[name] = {
      frames: frames.map((f) => pathToFileURL(path.join(dir, f)).href),
      fps: fps > 0 ? fps : 8,
      loop: typeof custom.loop === 'boolean' ? custom.loop : defaults.loop,
      next: typeof custom.next === 'string' && custom.next ? custom.next : defaults.next,
    };
  }
  return { states };
}

// Keeps the whole pet window inside the work area of the display it is on.
function clampToWorkArea(x, y) {
  const center = { x: Math.round(x + PET_SIZE / 2), y: Math.round(y + PET_SIZE / 2) };
  const area = screen.getDisplayNearestPoint(center).workArea;
  const maxX = area.x + area.width - PET_SIZE;
  const maxY = area.y + area.height - PET_SIZE;
  const cx = Math.min(Math.max(Math.round(x), area.x), maxX);
  const cy = Math.min(Math.max(Math.round(y), area.y), maxY);
  return { x: cx, y: cy, atEdge: cx !== Math.round(x) || cy !== Math.round(y) };
}

function movePetTo(x, y) {
  const pos = clampToWorkArea(x, y);
  petWindow.setBounds({ x: pos.x, y: pos.y, width: PET_SIZE, height: PET_SIZE });
  return pos;
}

function fromPet(event) {
  return !!petWindow && !petWindow.isDestroyed() && event.sender === petWindow.webContents;
}

function registerPetIpc() {
  ipcMain.handle('pet:list-animations', () => listAnimations());

  ipcMain.handle('pet:move-by', (event, payload) => {
    if (!fromPet(event)) return { x: 0, y: 0, atEdge: false };
    const b = petWindow.getBounds();
    return movePetTo(b.x + (Number(payload && payload.dx) || 0), b.y + (Number(payload && payload.dy) || 0));
  });

  ipcMain.on('pet:drag-start', (event, payload) => {
    if (!fromPet(event)) return;
    const b = petWindow.getBounds();
    const sx = Number(payload && payload.screenX);
    const sy = Number(payload && payload.screenY);
    const cursor = screen.getCursorScreenPoint();
    dragOffset = {
      x: (Number.isFinite(sx) ? sx : cursor.x) - b.x,
      y: (Number.isFinite(sy) ? sy : cursor.y) - b.y,
    };
  });

  ipcMain.on('pet:drag-move', (event, payload) => {
    if (!fromPet(event) || !dragOffset) return;
    const sx = Number(payload && payload.screenX);
    const sy = Number(payload && payload.screenY);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
    movePetTo(sx - dragOffset.x, sy - dragOffset.y);
  });

  ipcMain.on('pet:drag-end', () => {
    dragOffset = null;
  });

  ipcMain.on('pet:clicked', () => openDashboard());

  // Transparent areas click through; forward keeps mouse moves reaching the page for hover checks.
  ipcMain.on('pet:set-interactive', (event, payload) => {
    if (!fromPet(event)) return;
    petWindow.setIgnoreMouseEvents(!(payload && payload.interactive), { forward: true });
  });

  // Voice is LATER (whisper.cpp); the channel exists so the renderer gets a clean error.
  ipcMain.handle('pet:transcribe', () => ({ error: 'Voice input is not available yet.' }));

  ipcMain.handle('pet:chat', async (_event, payload) => {
    const message = String((payload && payload.message) || '').trim().slice(0, 500);
    if (!message) return { error: 'Type a message first.' };
    const body = { userId: settings.userId, message };
    if (lastCourseId) body.courseId = lastCourseId;
    const result = await backendFetch(
      '/chat',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
      60000
    );
    if (result.error) return { error: result.error };
    return typeof result.reply === 'string' ? { reply: result.reply } : { error: 'No reply from Pengu.' };
  });

  setInterval(() => {
    sendToPet('pet:system-idle', { seconds: powerMonitor.getSystemIdleTime() });
  }, 15000);
}

function registerDashboardIpc() {
  ipcMain.handle('dash:get-user', () => ({ userId: settings.userId, backendUrl: settings.backendUrl }));

  ipcMain.handle('dash:get-courses', () =>
    courses.loadManifest(app).map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description || '',
      lessonCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
      progress: courses.courseProgress(app, course),
      started: fs.existsSync(courses.userCoursePath(app, course)),
    }))
  );

  ipcMain.handle('dash:start-course', async (_event, payload) => {
    const courseId = payload && payload.courseId;
    const result = await courses.startCourse(app, courseId);
    const course = courses.findCourse(app, courseId);
    if (course && fs.existsSync(courses.userCoursePath(app, course))) {
      try {
        rememberCourse(course.id, courses.userCoursePath(app, course));
      } catch (err) {
        console.error('Could not update config.json courses:', err.message);
      }
    }
    return result;
  });

  ipcMain.handle('dash:get-progress', () =>
    backendFetch(`/progress/${encodeURIComponent(settings.userId)}`, {}, 15000)
  );

  ipcMain.on('dash:open-external', (_event, payload) => {
    const url = payload && typeof payload.url === 'string' ? payload.url : '';
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => openDashboard());

  app.whenReady().then(() => {
    const defaults = loadDefaults();
    const userId = ensureUserId();
    settings = { userId, ...defaults };
    const configPath = writeSharedConfig(userId, defaults);
    console.log('Pengu config:', configPath);
    registerPetIpc();
    registerDashboardIpc();
    startBridge(settings.bridgePort, handleBridgeEvent);
    petWindow = createPetWindow();
    // Wakes a sleeping Render instance before the first review (CONTEXT assumption 5).
    backendFetch('/health', {}, 45000).then((health) => console.log('Backend health:', JSON.stringify(health)));
  });
}

app.on('window-all-closed', () => {
  app.quit();
});
