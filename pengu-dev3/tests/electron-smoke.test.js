const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Require the Dev2 main logic or duplicate the environment to test Dev2 main
const mainPath = path.join(__dirname, '..', 'app', 'main.js');

console.log('====================================================');
console.log('   PENGU COMPANION PET - ELECTRON SMOKE TEST SUITE  ');
console.log('====================================================');

let mainWindow = null;
let dragOffset = null;
const tests = [];
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Reuse Dev2 main logic
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

// Dev2 IPC Handlers
ipcMain.handle('pet:list-animations', async () => {
  return getAnimations();
});

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

ipcMain.on('pet:drag-move', (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed() || !dragOffset) return;
  const screenX = Number(payload.screenX);
  const screenY = Number(payload.screenY);
  if (isNaN(screenX) || isNaN(screenY)) return;

  const newX = Math.round(screenX - dragOffset.x);
  const newY = Math.round(screenY - dragOffset.y);
  mainWindow.setPosition(newX, newY);
});

ipcMain.on('pet:drag-end', (_event, _payload = {}) => {
  dragOffset = null;
});

let clickedReceived = false;
ipcMain.on('pet:clicked', (_event) => {
  clickedReceived = true;
  mainWindow.webContents.send('pet:say', {
    text: "You clicked me! How can I assist?",
    kind: 'chat',
    ttlMs: 4000
  });
});

let interactiveSetting = null;
ipcMain.on('pet:set-interactive', (_event, payload = {}) => {
  interactiveSetting = !!payload.interactive;
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.setIgnoreMouseEvents(!interactiveSetting, { forward: true });
    } catch (e) {}
  }
});

let chatReceivedMsg = null;
ipcMain.handle('pet:chat', async (_event, payload = {}) => {
  chatReceivedMsg = payload.message;
  return { reply: "What does your loop terminating condition look like?" };
});

ipcMain.handle('pet:transcribe', async () => {
  return { text: "Explain time complexity" };
});

async function runTests() {
  try {
    console.log('\n--- 1. Window & Environment Verification ---');
    assert(mainWindow !== null, 'Electron BrowserWindow was created');
    const [w, h] = mainWindow.getSize();
    assert(w === 260 && h === 260, `Window size is exactly 260x260 (got ${w}x${h})`);
    assert(mainWindow.isAlwaysOnTop(), 'Window is always-on-top');
    assert(mainWindow.isFocusable(), 'Window is focusable for chat input');

    console.log('\n--- 2. Preload & Safe Bridge Verification ---');
    const bridgeOk = await mainWindow.webContents.executeJavaScript(`
      Boolean(window.pengu &&
        typeof window.pengu.invoke === 'function' &&
        typeof window.pengu.send === 'function' &&
        typeof window.pengu.on === 'function' &&
        typeof window.pengu.hasChannel === 'function')
    `);
    assert(bridgeOk, 'window.pengu bridge is exposed properly via contextBridge');

    const channelTranscribe = await mainWindow.webContents.executeJavaScript(`
      window.pengu.hasChannel('pet:transcribe')
    `);
    assert(channelTranscribe === true, 'window.pengu.hasChannel detects pet:transcribe');

    console.log('\n--- 3. P1: Animation Loading with file:/// Frame Paths ---');
    // Wait for window.Pet.ready to resolve
    await mainWindow.webContents.executeJavaScript(`window.Pet.ready`);

    const statesLoaded = await mainWindow.webContents.executeJavaScript(`
      window.Pet.states()
    `);
    console.log('    Loaded states:', statesLoaded);
    assert(statesLoaded.includes('idle'), 'idle state loaded');
    assert(statesLoaded.includes('walk'), 'walk state loaded');
    assert(statesLoaded.includes('hello'), 'hello state loaded');
    assert(statesLoaded.includes('dragged'), 'dragged state loaded');
    assert(statesLoaded.includes('thinking'), 'thinking state loaded');
    assert(statesLoaded.includes('talking'), 'talking state loaded');
    assert(statesLoaded.includes('sleeping'), 'sleeping state loaded');

    const spriteInfo = await mainWindow.webContents.executeJavaScript(`
      (function() {
        const s = document.getElementById('sprite');
        return {
          src: s.src,
          hidden: s.hidden,
          dataState: s.getAttribute('data-state'),
          dataSingle: s.getAttribute('data-single')
        };
      })()
    `);
    assert(spriteInfo.src.startsWith('file:///'), `Sprite frame src is a valid file:/// URL (${spriteInfo.src.slice(0, 45)}...)`);
    assert(!spriteInfo.hidden, 'Sprite element is visible (not hidden)');
    assert(spriteInfo.dataSingle === 'false', 'data-single is false because multi-frame art was supplied');

    console.log('\n--- 4. P2: Window Dragging & Movement ---');
    const [initX, initY] = mainWindow.getPosition();
    console.log(`    Initial window position: (${initX}, ${initY})`);

    // Simulate 5px drag threshold crossing and move
    await mainWindow.webContents.executeJavaScript(`
      window.pengu.send('pet:drag-start', { screenX: ${initX + 50}, screenY: ${initY + 50} });
      window.pengu.send('pet:drag-move', { screenX: ${initX + 90}, screenY: ${initY + 110} });
    `);
    // Wait small tick for IPC
    await new Promise(r => setTimeout(r, 100));

    const [draggedX, draggedY] = mainWindow.getPosition();
    console.log(`    Dragged window position: (${draggedX}, ${draggedY})`);
    assert(draggedX === initX + 40 && draggedY === initY + 60, `Window was dragged accurately (+40, +60)`);

    await mainWindow.webContents.executeJavaScript(`
      window.pengu.send('pet:drag-end', { moved: true });
    `);

    // Test wander move-by
    const wanderResult = await mainWindow.webContents.executeJavaScript(`
      window.pengu.invoke('pet:move-by', { dx: -20, dy: 0 })
    `);
    assert(typeof wanderResult.x === 'number' && typeof wanderResult.atEdge === 'boolean', 'pet:move-by returned { x, y, atEdge }');
    const [afterWanderX] = mainWindow.getPosition();
    assert(afterWanderX === draggedX - 20, 'Window position shifted by dx -20');

    console.log('\n--- 5. P2: State Machine Priorities & Pet Click ---');
    // Test pet click
    clickedReceived = false;
    await mainWindow.webContents.executeJavaScript(`
      window.pengu.send('pet:clicked', {})
    `);
    await new Promise(r => setTimeout(r, 150));
    assert(clickedReceived === true, 'Main received pet:clicked event');

    // Check that click caused speech bubble
    const bubbleAfterClick = await mainWindow.webContents.executeJavaScript(`
      (function() {
        const b = document.getElementById('bubble');
        return b ? { text: b.textContent, show: b.classList.contains('show') } : null;
      })()
    `);
    assert(bubbleAfterClick !== null, 'Click triggered speech bubble response');
    console.log('    Bubble text from click:', bubbleAfterClick.text);

    // Dismiss bubble for next tests
    await mainWindow.webContents.executeJavaScript(`window.PenguBubble.dismiss()`);
    await new Promise(r => setTimeout(r, 300));

    console.log('\n--- 6. P3: Speech Bubble Markdown Stripping & Word Capping ---');
    await mainWindow.webContents.executeJavaScript(`
      window.PenguBubble.say('Here is **bold** and \`code\` with a very long message that exceeds twenty-five words to make sure it caps properly at twenty-five words exactly as specified in the contract requirements and guidelines.', 'review');
    `);
    await new Promise(r => setTimeout(r, 100));

    const bubbleCleaned = await mainWindow.webContents.executeJavaScript(`
      (function() {
        const b = document.getElementById('bubble');
        return b ? b.textContent : '';
      })()
    `);
    console.log('    Capped and cleaned bubble text:', bubbleCleaned);
    assert(!bubbleCleaned.includes('**') && !bubbleCleaned.includes('`'), 'Markdown and code formatting stripped');
    assert(bubbleCleaned.endsWith('…'), 'Text exceeding 25 words is capped with ellipsis');

    await mainWindow.webContents.executeJavaScript(`window.PenguBubble.dismiss()`);
    await new Promise(r => setTimeout(r, 300));

    console.log('\n--- 7. P4: Hover Chat Box Typing & Socratic Dialogue ---');
    // Show chat box
    await mainWindow.webContents.executeJavaScript(`window.PenguChat.show()`);
    const chatVisible = await mainWindow.webContents.executeJavaScript(`
      !document.getElementById('chat').hidden
    `);
    assert(chatVisible === true, 'Chat box is made visible on hover/show');

    // Type query into input and submit
    const testQuestion = "Why does quicksort degrade to O(N^2)?";
    chatReceivedMsg = null;
    await mainWindow.webContents.executeJavaScript(`
      (function() {
        window.PenguChat.input.value = ${JSON.stringify(testQuestion)};
        window.PenguChat.submit();
      })()
    `);

    // Give time for IPC invoke and reply
    await new Promise(r => setTimeout(r, 900));

    assert(chatReceivedMsg === testQuestion, `Main received exact chat message: "${chatReceivedMsg}"`);

    const chatReplyBubble = await mainWindow.webContents.executeJavaScript(`
      (function() {
        const b = document.getElementById('bubble');
        return b ? { text: b.textContent, isChat: b.classList.contains('kind-chat') } : null;
      })()
    `);
    assert(chatReplyBubble !== null, 'Chat reply rendered in speech bubble');
    assert(chatReplyBubble.isChat === true, 'Speech bubble has kind-chat class');
    console.log('    Pet Socratic reply in bubble:', chatReplyBubble.text);

    // Dismiss chat bubble before testing sleep/idle
    await mainWindow.webContents.executeJavaScript(`window.PenguBubble.dismiss()`);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- 8. P2: Sleep & Wake Transitions ---');
    // Stimulate idle >= 300s
    mainWindow.webContents.send('pet:system-idle', { seconds: 350 });
    await new Promise(r => setTimeout(r, 100));

    const isSleeping = await mainWindow.webContents.executeJavaScript(`
      window.Pet.effective() === 'sleeping'
    `);
    assert(isSleeping === true, 'Pet transitions to sleeping when system-idle >= 300s');

    // Wake up by user action / wake()
    await mainWindow.webContents.executeJavaScript(`window.Pet.wake()`);
    await new Promise(r => setTimeout(r, 100));

    const isAwake = await mainWindow.webContents.executeJavaScript(`
      window.Pet.effective() !== 'sleeping'
    `);
    assert(isAwake === true, 'Pet wakes up from sleep on user interaction');

    console.log('\n--- 9. P2: External Main State Control (pet:state) ---');
    mainWindow.webContents.send('pet:state', { state: 'thinking', reason: 'orchestrator run' });
    await new Promise(r => setTimeout(r, 100));

    const isThinking = await mainWindow.webContents.executeJavaScript(`
      window.Pet.effective() === 'thinking'
    `);
    assert(isThinking === true, 'Main pet:state { state: "thinking" } puts pet into thinking state');

    // Send pet:state idle
    mainWindow.webContents.send('pet:state', { state: 'idle' });
    await new Promise(r => setTimeout(r, 100));

    const isIdleAgain = await mainWindow.webContents.executeJavaScript(`
      window.Pet.effective() === 'idle'
    `);
    assert(isIdleAgain === true, 'Main pet:state { state: "idle" } clears main holds back to idle');

    console.log('\n--- 10. P4: Voice Transcription Path ---');
    const transcribed = await mainWindow.webContents.executeJavaScript(`
      window.pengu.invoke('pet:transcribe', { wavBase64: 'fakeWavData' })
    `);
    assert(transcribed && transcribed.text, `Transcription IPC returned text: "${transcribed.text}"`);

    console.log('\n--- 11. Interactive Click-Through Mask IPC ---');
    await mainWindow.webContents.executeJavaScript(`
      window.pengu.send('pet:set-interactive', { interactive: true });
    `);
    await new Promise(r => setTimeout(r, 50));
    assert(interactiveSetting === true, 'pet:set-interactive true handled');

    await mainWindow.webContents.executeJavaScript(`
      window.pengu.send('pet:set-interactive', { interactive: false });
    `);
    await new Promise(r => setTimeout(r, 50));
    assert(interactiveSetting === false, 'pet:set-interactive false handled');

    console.log('\n====================================================');
    console.log(`   ALL TESTS PASSED! (${passedCount} passed, 0 failed)`);
    console.log('====================================================\n');

    app.exit(0);
  } catch (err) {
    console.error('\nTest suite failed with error:', err);
    console.error(`Results: ${passedCount} passed, ${failedCount} failed`);
    app.exit(1);
  }
}

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  mainWindow = new BrowserWindow({
    width: 260,
    height: 260,
    x: workArea.x + workArea.width - 290,
    y: workArea.y + workArea.height - 290,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'app', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const indexPath = path.join(__dirname, '..', 'app', 'pet', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.webContents.once('did-finish-load', () => {
    // Wait brief moment for scripts to initialize
    setTimeout(runTests, 400);
  });
});
