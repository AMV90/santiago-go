/**
 * Prepara assets do xogo antes de arrancar o servidor (só npm run play).
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const STAMP = path.join(ROOT, '.cache', 'play-assets.stamp');
const LPC_STAMP = path.join(ROOT, '.cache', 'lpc-assets.stamp');

const PELETEIRO_INPUTS = [
  path.join(ROOT, 'scripts', 'build-peleteiro-tileset.mjs'),
  path.join(ROOT, 'scripts', 'interiors', 'paint-peleteiro-hd-bases.mjs'),
  path.join(ROOT, 'scripts', 'interiors', 'peleteiro-bake.mjs'),
  path.join(ROOT, 'scripts', 'interiors', 'peleteiro-frame-map.mjs'),
  path.join(ROOT, 'public', 'js', 'interiors', 'layouts', 'peleteiro-patio.layout.js'),
  path.join(ROOT, 'public', 'js', 'interiors', 'layouts', 'peleteiro-floor.layout.js'),
];

const LPC_INPUTS = [
  path.join(ROOT, 'scripts', 'lpc', 'characters.base.json'),
  path.join(ROOT, 'scripts', 'lpc', 'expand-lpc-roster.mjs'),
  path.join(ROOT, 'scripts', 'lpc', 'roster-pools.mjs'),
  path.join(ROOT, 'scripts', 'lpc', 'archetypes.json'),
  path.join(ROOT, 'scripts', 'build-lpc-sprites.mjs'),
];

const PELETEIRO_OUTPUTS = [
  path.join(ROOT, 'public', 'assets', 'tilesets', 'peleteiro.png'),
  path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'built', 'patio', 'base.png'),
  path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'built', 'floor-3', 'base.png'),
];

function newestMtime(paths) {
  let max = 0;
  for (const p of paths) {
    if (!fs.existsSync(p)) return Infinity;
    const t = fs.statSync(p).mtimeMs;
    if (t > max) max = t;
  }
  return max;
}

function needsRebuild(inputs, outputs, stampPath) {
  if (!outputs.every((p) => fs.existsSync(p))) return true;
  const stampMs = fs.existsSync(stampPath) ? fs.statSync(stampPath).mtimeMs : 0;
  return newestMtime(inputs) > stampMs;
}

function runNode(rel) {
  execSync(`node "${path.join(ROOT, rel)}"`, { cwd: ROOT, stdio: 'inherit', shell: true });
}

function buildPeleteiro() {
  console.log('Preparando Peleteiro (tileset + mapas HD)…\n');
  fs.mkdirSync(path.dirname(STAMP), { recursive: true });
  runNode('scripts/build-peleteiro-tileset.mjs');
  runNode('scripts/interiors/paint-peleteiro-hd-bases.mjs');
  runNode('scripts/interiors/peleteiro-bake.mjs');
  fs.writeFileSync(STAMP, String(Date.now()));
}

function buildLpc() {
  if (!fs.existsSync(path.join(ROOT, '.lpc-src', 'spritesheets'))) {
    console.warn('(LPC: falta .lpc-src — executa npm run lpc:sync unha vez)');
    return;
  }
  console.log('\nXerando roster LPC (200+ personaxes)…\n');
  fs.mkdirSync(path.dirname(LPC_STAMP), { recursive: true });
  runNode('scripts/lpc/expand-lpc-roster.mjs');
  execSync('npm run sprites:lpc', { cwd: ROOT, stdio: 'inherit', shell: true });
  fs.writeFileSync(LPC_STAMP, String(Date.now()));
}

function main() {
  if (needsRebuild(PELETEIRO_INPUTS, PELETEIRO_OUTPUTS, STAMP)) {
    buildPeleteiro();
  }

  const lpcManifest = path.join(ROOT, 'public', 'js', 'lpc-manifest-data.js');
  const lpcNeeds =
    needsRebuild(LPC_INPUTS, [lpcManifest], LPC_STAMP) ||
    !fs.existsSync(lpcManifest) ||
    (fs.existsSync(path.join(ROOT, 'scripts', 'lpc', 'characters.json')) &&
      fs.statSync(path.join(ROOT, 'scripts', 'lpc', 'characters.json')).mtimeMs >
        fs.statSync(lpcManifest).mtimeMs);

  if (lpcNeeds) buildLpc();

  console.log('\n✓ Assets listos.\n');
}

main();
