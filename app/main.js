const { app, BrowserWindow, screen } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Pet pages live in app/pet and animation frames in app/assets (CONTRACT §5 file:// URLs).
app.commandLine.appendSwitch('allow-file-access-from-files');

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function createPetWindow() {
  const win = new BrowserWindow({
    width: 260,
    height: 260,
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
    x: Math.round(area.x + area.width - 260 - 24),
    y: Math.round(area.y + area.height - 260 - 24),
    width: 260,
    height: 260,
  });
  win.setAlwaysOnTop(true, 'floating');
  win.loadFile(path.join(__dirname, 'pet', 'index.html'));
  return win;
}

app.whenReady().then(() => {
  const defaults = loadDefaults();
  const userId = ensureUserId();
  const configPath = writeSharedConfig(userId, defaults);
  console.log('Pengu config:', configPath);
  createPetWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
