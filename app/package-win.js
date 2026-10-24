// Windows release build (docs/RELEASE.md): npm run package → dist/Pengu-win32-x64 + dist/Pengu-win.zip
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const packager = require('electron-packager');

const root = path.join(__dirname, '..');
const out = path.join(root, 'dist');
const contentDir = path.join(root, 'content');
const extDir = path.join(root, 'vscode-ext');
const icon = path.join(__dirname, 'assets', 'icon.ico');

function findVsix() {
  try {
    const name = fs.readdirSync(extDir).filter((f) => /^pengu-watcher-.*\.vsix$/i.test(f)).sort().pop();
    return name ? path.join(extDir, name) : null;
  } catch (err) {
    return null;
  }
}

async function main() {
  const backendUrl = require('./config.default.json').backendUrl;
  if (/localhost|127\.0\.0\.1/.test(backendUrl)) {
    console.warn(`WARNING: config.default.json backendUrl is ${backendUrl}; users need the production Render URL.`);
  }

  const extraResource = [contentDir];
  const vsix = findVsix();
  if (vsix) extraResource.push(vsix);
  else console.warn('WARNING: no vscode-ext/pengu-watcher-*.vsix; the zip will not install the extension.');

  const [appDir] = await packager({
    dir: __dirname,
    name: 'Pengu',
    platform: 'win32',
    arch: 'x64',
    out,
    overwrite: true,
    asar: true,
    prune: true,
    extraResource,
    ignore: [/^\/package-win\.js$/],
    ...(fs.existsSync(icon) ? { icon } : {}),
  });

  const readme = path.join(contentDir, 'README.md');
  if (fs.existsSync(readme)) fs.copyFileSync(readme, path.join(appDir, 'README-FIRST.txt'));

  const zip = path.join(out, 'Pengu-win.zip');
  fs.rmSync(zip, { force: true });
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-Command', `Compress-Archive -Path '${appDir}\\*' -DestinationPath '${zip}'`],
    { stdio: 'inherit' }
  );
  console.log(`Built ${appDir}\nZipped ${zip} (${Math.round(fs.statSync(zip).size / 1048576)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
