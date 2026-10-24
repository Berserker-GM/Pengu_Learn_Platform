const { app, BrowserWindow, screen, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

let mainWindow = null;
let dragOffset = null;
let idleInterval = null;

// Socratic dialogue responses for chat
const SOCRATIC_RESPONSES = [
  "What invariants must hold at each step of this iteration?",
  "How does this choice affect the time and space complexity?",
  "Have you considered the edge case when the input collection is empty?",
  "Could a hash map give you O(1) lookups here instead of linear scans?",
  "What happens if two concurrent requests access this resource simultaneously?"
];

function getAnimations() {
  const animsDir = path.join(__dirname, '..', 'assets', 'animations');
  const states = {};

  const stateConfigs = {
    hello: { loop: false, next: 'idle', fps: 4 },
    idle: { loop: true, next: null, fps: 2 },
    walk: { loop: true, next: 'idle', fps: 4 },
    dragged: { loop: true, next: 'idle', fps: 4 },
    hover_jump: { loop: false, next: 'idle', fps: 4 },
    thinking: { loop: true, next: 'idle', fps: 4 },
    sending: { loop: false, next: 'thinking', fps: 4 },
    talking: { loop: true, next: 'idle', fps: 4 },
    sleeping: { loop: true, next: 'idle', fps: 2 }
  };

  for (const [stateName, config] of Object.entries(stateConfigs)) {
    const dir = path.join(animsDir, stateName);
    const frames = [];
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg') || f.endsWith('.png'));
      files.sort().forEach(f => {
        const fullPath = path.join(dir, f);
        frames.push(url.pathToFileURL(fullPath).href);
      });
    }
    states[stateName] = {
      frames,
      fps: config.fps,
      loop: config.loop,
      next: config.next
    };
  }

  return { states };
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  // Position at bottom-right corner of screen
  const defaultX = workArea.x + workArea.width - 290;
  const defaultY = workArea.y + workArea.height - 290;

  mainWindow = new BrowserWindow({
    width: 260,
    height: 260,
    x: defaultX,
    y: defaultY,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    focusable: true, // Crucial for chat input!
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  try {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  } catch (e) {
    mainWindow.setAlwaysOnTop(true);
  }

  const indexPath = path.join(__dirname, 'pet', 'index.html');
  mainWindow.loadFile(indexPath);

  // Monitor idle time and send to renderer
  idleInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    try {
      const idleSec = powerMonitor ? powerMonitor.getSystemIdleTime() : 0;
      mainWindow.webContents.send('pet:system-idle', { seconds: idleSec });
    } catch (e) {}
  }, 5000);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (idleInterval) clearInterval(idleInterval);
  });
}

// ======================== Dev2 IPC Handlers ========================

// P1: Frame animations list with file:/// URLs
ipcMain.handle('pet:list-animations', async () => {
  return getAnimations();
});

// P2: Wander movement
ipcMain.handle('pet:move-by', async (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return { x: 0, y: 0, atEdge: false };
  const [curX, curY] = mainWindow.getPosition();
  const display = screen.getDisplayNearestPoint({ x: curX, y: curY });
  const { x: minX, y: minY, width, height } = display.workArea;
  const maxX = minX + width - 260;
  const maxY = minY + height - 260;

  const dx = Number(payload.dx) || 0;
  const dy = Number(payload.dy) || 0;

  const targetX = curX + dx;
  const targetY = curY + dy;

  const clampedX = Math.round(Math.max(minX, Math.min(maxX, targetX)));
  const clampedY = Math.round(Math.max(minY, Math.min(maxY, targetY)));
  const atEdge = targetX <= minX || targetX >= maxX;

  mainWindow.setPosition(clampedX, clampedY);
  return { x: clampedX, y: clampedY, atEdge };
});

// P2: Drag start (5px threshold crossed)
ipcMain.on('pet:drag-start', (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [winX, winY] = mainWindow.getPosition();
  const screenX = Number(payload.screenX) || winX;
  const screenY = Number(payload.screenY) || winY;
  dragOffset = {
    x: screenX - winX,
    y: screenY - winY
  };
});

// P2: Drag move
ipcMain.on('pet:drag-move', (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed() || !dragOffset) return;
  const screenX = Number(payload.screenX);
  const screenY = Number(payload.screenY);
  if (isNaN(screenX) || isNaN(screenY)) return;

  const newX = Math.round(screenX - dragOffset.x);
  const newY = Math.round(screenY - dragOffset.y);
  mainWindow.setPosition(newX, newY);
});

// P2: Drag end
ipcMain.on('pet:drag-end', (_event, _payload = {}) => {
  dragOffset = null;
});

// P2: Pet clicked
ipcMain.on('pet:clicked', (_event, _payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  console.log('[Dev2 Main] Pet was clicked');
  // Gentle greeting or question on click
  mainWindow.webContents.send('pet:say', {
    text: "Need a hint with your current task?",
    kind: 'chat',
    ttlMs: 5000
  });
});

// Optional click-through mask
ipcMain.on('pet:set-interactive', (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const interactive = !!payload.interactive;
  try {
    mainWindow.setIgnoreMouseEvents(!interactive, { forward: true });
  } catch (e) {}
});

// P4: Chat input
ipcMain.handle('pet:chat', async (_event, payload = {}) => {
  const msg = (payload && payload.message) || '';
  console.log('[Dev2 Main] Chat message received:', msg);

  // Pick a Socratic question or response
  const idx = Math.abs(msg.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % SOCRATIC_RESPONSES.length;
  const reply = SOCRATIC_RESPONSES[idx];

  // Emulate backend response time
  await new Promise(r => setTimeout(r, 600));
  return { reply };
});

// P4: Transcribe (voice)
ipcMain.handle('pet:transcribe', async (_event, _payload = {}) => {
  return { text: "What invariant does this recursive call maintain?" };
});

// Helper IPC for automated test inspection and stimulus
ipcMain.handle('test:get-window-info', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  const [x, y] = mainWindow.getPosition();
  const [w, h] = mainWindow.getSize();
  return {
    x, y, width: w, height: h,
    isFocused: mainWindow.isFocused(),
    isVisible: mainWindow.isVisible(),
    isAlwaysOnTop: mainWindow.isAlwaysOnTop()
  };
});

ipcMain.on('test:send-ipc', (_event, { channel, payload }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channel, payload);
});

// Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
