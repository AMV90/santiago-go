/**
 * Clona capas LPC (sparse) para npm run lpc:build
 * Fonte: https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LPC = path.join(ROOT, '.lpc-src');

const SPARSE_DIRS = [
  'spritesheets/body',
  'spritesheets/legs',
  'spritesheets/feet',
  'spritesheets/torso',
  'spritesheets/head',
  'spritesheets/hair',
];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: opts.cwd ?? ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function main() {
  if (fs.existsSync(path.join(LPC, 'spritesheets', 'body'))) {
    console.log('✓ .lpc-src xa existe');
    return;
  }

  console.log('Clonando Universal LPC (sparse, ~só capas de personaxe)…');
  run('git', [
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    'https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator.git',
    '.lpc-src',
  ]);

  run('git', ['sparse-checkout', 'set', ...SPARSE_DIRS], { cwd: LPC });
  run('git', ['checkout'], { cwd: LPC });
  console.log('✓ Capas LPC listas en .lpc-src/');
}

main();
