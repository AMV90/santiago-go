/**
 * Instala dependencias Python e copia skills de agent-sprite-forge ao proxecto.
 * Uso: npm run forge:setup
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const FORGE = path.join(ROOT, 'tools', 'agent-sprite-forge');
const CURSOR_SKILLS = path.join(ROOT, '.cursor', 'skills');

if (!fs.existsSync(FORGE)) {
  console.error('Falta tools/agent-sprite-forge. Clona o repo primeiro.');
  process.exit(1);
}

console.log('Instalando Python deps…');
execSync('python -m pip install -r requirements.txt', { cwd: FORGE, stdio: 'inherit' });

fs.mkdirSync(CURSOR_SKILLS, { recursive: true });
for (const name of ['generate2dsprite', 'generate2dmap']) {
  const src = path.join(FORGE, 'skills', name);
  const dst = path.join(CURSOR_SKILLS, name);
  fs.cpSync(src, dst, { recursive: true, force: true });
  console.log(`✓ skill → .cursor/skills/${name}`);
}

console.log('\nListo. En Cursor: "Use $generate2dmap …" (ver docs/peleteiro-sprite-forge.md)');
