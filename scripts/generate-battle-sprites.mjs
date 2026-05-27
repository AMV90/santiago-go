/**
 * Xera SVG de combate estilo Pokémon (vista xogador = costas, rival = fronte).
 * Uso: node scripts/generate-battle-sprites.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'assets', 'battle');

const SKIN = '#ffdbac';
const SKIN_SHADOW = '#e8b896';
const OUTLINE = '#1a2332';

function px(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" />`;
}

/** Xogador — costas (estilo adestrador) */
function svgPlayerBack() {
  const s = 4; // escala pixel
  const parts = [];
  const add = (x, y, w, h, c) => parts.push(px(x * s, y * s, w * s, h * s, c));

  add(10, 20, 4, 1, 'rgba(0,0,0,0.2)');
  add(8, 4, 8, 3, '#3d4a5c');
  add(7, 5, 10, 2, '#3d4a5c');
  add(9, 7, 6, 6, SKIN);
  add(8, 6, 8, 2, '#5a4030');
  add(7, 8, 10, 9, '#3d8bfd');
  add(10, 9, 4, 7, '#2a6fd4');
  add(6, 10, 2, 6, '#3d8bfd');
  add(14, 10, 2, 6, '#3d8bfd');
  add(8, 16, 3, 5, '#2c3e50');
  add(11, 16, 3, 5, '#2c3e50');
  add(7, 20, 4, 2, '#1a2332');
  add(11, 20, 4, 2, '#1a2332');
  add(6, 9, 2, 2, '#f4d35e');
  add(14, 9, 2, 2, '#f4d35e');
  add(9, 11, 6, 2, '#f4d35e');

  return wrapSvg(parts, '#3d8bfd');
}

/** Rival — fronte */
function svgEnemyFront(palette) {
  const { hair, shirt, pants, accent, skin = SKIN } = palette;
  const s = 4;
  const parts = [];
  const add = (x, y, w, h, c) => parts.push(px(x * s, y * s, w * s, h * s, c));

  add(9, 20, 6, 1, 'rgba(0,0,0,0.2)');
  add(7, 3, 10, 3, hair);
  add(6, 4, 12, 2, hair);
  add(8, 6, 8, 7, skin);
  add(9, 8, 2, 2, OUTLINE);
  add(13, 8, 2, 2, OUTLINE);
  add(10, 11, 4, 1, SKIN_SHADOW);
  add(6, 13, 12, 8, shirt);
  add(7, 14, 10, 2, accent);
  add(5, 14, 2, 7, shirt);
  add(17, 14, 2, 7, shirt);
  add(5, 14, 2, 5, skin);
  add(17, 14, 2, 5, skin);
  add(7, 21, 4, 3, pants);
  add(13, 21, 4, 3, pants);
  add(7, 23, 4, 1, '#1a2332');
  add(13, 23, 4, 1, '#1a2332');

  return wrapSvg(parts, shirt);
}

function svgBandit() {
  const s = 4;
  const parts = [];
  const add = (x, y, w, h, c) => parts.push(px(x * s, y * s, w * s, h * s, c));

  add(9, 20, 6, 1, 'rgba(0,0,0,0.25)');
  add(6, 2, 12, 4, '#2c1810');
  add(7, 3, 10, 8, '#3d2817');
  add(8, 5, 8, 6, '#ffdbac');
  add(9, 7, 2, 2, OUTLINE);
  add(13, 7, 2, 2, OUTLINE);
  add(5, 12, 14, 9, '#5c2d2d');
  add(6, 13, 12, 2, '#922b21');
  add(4, 13, 2, 6, '#5c2d2d');
  add(18, 13, 2, 6, '#5c2d2d');
  add(7, 21, 4, 3, '#1a2332');
  add(13, 21, 4, 3, '#1a2332');

  return wrapSvg(parts, '#922b21');
}

function wrapSvg(rects, accent) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
    </filter>
  </defs>
  <ellipse cx="48" cy="90" rx="32" ry="6" fill="#000" opacity="0.18"/>
  <g filter="url(#shadow)">${rects.join('\n  ')}</g>
</svg>`;
}

const ENEMY_PALETTES = [
  { hair: '#5a4030', shirt: '#e74c3c', pants: '#2c3e50', accent: '#c0392b' },
  { hair: '#4a3728', shirt: '#9b59b6', pants: '#34495e', accent: '#8e44ad' },
  { hair: '#2c1810', shirt: '#e67e22', pants: '#2c3e50', accent: '#d35400' },
  { hair: '#3d3d3d', shirt: '#16a085', pants: '#1a2332', accent: '#1abc9c' },
  { hair: '#6b4423', shirt: '#f39c12', pants: '#2c3e50', accent: '#e67e22' },
  { hair: '#1a1a1a', shirt: '#c0392b', pants: '#1a2332', accent: '#7f1d1d' },
];

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'player.svg'), svgPlayerBack());

ENEMY_PALETTES.forEach((pal, i) => {
  fs.writeFileSync(path.join(OUT, `enemy-${i}.svg`), svgEnemyFront(pal));
});
fs.writeFileSync(path.join(OUT, 'enemy-bandit.svg'), svgBandit());

console.log('Sprites de combate SVG en public/assets/battle/');
