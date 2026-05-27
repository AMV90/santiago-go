/**
 * Xera sprites PNG de exemplo (16×24 por frame, 4 frames en fila).
 * Uso: node scripts/generate-example-sprites.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'assets', 'sprites');

const W = 16;
const H = 24;
const FRAMES = 4;

/** @typedef {{ skin: number[], hair: number[], shirt: number[], pants: number[], shoes: number[], accent: number[] }} Palette */

/** @param {PNG} png @param {number} x @param {number} y @param {number[]} rgba */
function px(png, x, y, rgba) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (png.width * y + x) << 2;
  png.data[i] = rgba[0];
  png.data[i + 1] = rgba[1];
  png.data[i + 2] = rgba[2];
  png.data[i + 3] = rgba[3] ?? 255;
}

function rect(png, x, y, w, h, rgba) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) px(png, x + dx, y + dy, rgba);
  }
}

/** @param {PNG} png @param {number} ox frame offset x */
function drawFrame(png, ox, frame, palette, style) {
  const { skin, hair, shirt, pants, shoes, accent } = palette;
  const skinShade = [232, 184, 150, 255];
  const legSwing = frame % 2 === 0 ? 0 : (frame === 1 ? -1 : 1);
  const bob = frame === 2 ? 0 : 1;

  const baseY = 4 + bob;

  rect(png, ox + 4, 22, 8, 1, [0, 0, 0, 60]);

  rect(png, ox + 4, baseY, 8, 3, hair);
  rect(png, ox + 3, baseY + 2, 10, 2, hair);
  px(png, ox + 5, baseY + 1, [255, 255, 255, 90]);
  px(png, ox + 6, baseY + 1, [255, 255, 255, 90]);

  rect(png, ox + 5, baseY + 3, 6, 5, skin);
  px(png, ox + 9, baseY + 6, skinShade);
  px(png, ox + 9, baseY + 7, skinShade);
  px(png, ox + 6, baseY + 5, [20, 20, 30, 255]);
  px(png, ox + 9, baseY + 5, [20, 20, 30, 255]);
  rect(png, ox + 7, baseY + 7, 2, 1, [192, 128, 96, 255]);

  px(png, ox + 7, baseY + 8, skin);
  px(png, ox + 8, baseY + 8, skin);

  rect(png, ox + 4, baseY + 9, 8, 6, shirt);
  rect(png, ox + 4, baseY + 9, 1, 6, [0, 0, 0, 45]);
  rect(png, ox + 5, baseY + 9, 6, 1, [0, 0, 0, 35]);

  if (style === 'player') {
    rect(png, ox + 7, baseY + 10, 2, 4, accent);
    px(png, ox + 3, baseY + 10, [42, 53, 72, 255]);
    px(png, ox + 3, baseY + 11, [42, 53, 72, 255]);
    px(png, ox + 3, baseY + 12, [42, 53, 72, 255]);
  }
  if (style === 'remote') {
    rect(png, ox + 4, baseY + 9, 8, 2, accent);
    rect(png, ox + 6, baseY + 11, 4, 1, accent);
  }

  rect(png, ox + 2, baseY + 10, 2, 5, shirt);
  rect(png, ox + 12, baseY + 10, 2, 5, shirt);
  px(png, ox + 2, baseY + 14, skin);
  px(png, ox + 13, baseY + 14, skin);

  rect(png, ox + 5, baseY + 14, 6, 1, pants);

  const lOff = legSwing;
  const rOff = -legSwing;
  rect(png, ox + 5 + lOff, baseY + 15, 3, 6, pants);
  rect(png, ox + 9 + rOff, baseY + 15, 3, 6, pants);
  px(png, ox + 5 + lOff, baseY + 18, [0, 0, 0, 40]);
  px(png, ox + 5 + lOff, baseY + 19, [0, 0, 0, 40]);
  px(png, ox + 9 + rOff, baseY + 18, [0, 0, 0, 40]);
  px(png, ox + 9 + rOff, baseY + 19, [0, 0, 0, 40]);
  rect(png, ox + 5 + lOff, baseY + 20, 3, 2, shoes);
  rect(png, ox + 9 + rOff, baseY + 20, 3, 2, shoes);

  if (style === 'npc') {
    rect(png, ox + 3, baseY + 8, 10, 2, accent);
    rect(png, ox + 6, baseY + 10, 4, 1, accent);
  }
  if (style === 'bot') {
    rect(png, ox + 6, baseY + 7, 4, 1, accent);
    rect(png, ox + 7, baseY + 8, 2, 1, accent);
  }
}

/** @param {Palette} palette @param {'player'|'bot'|'npc'|'remote'} style */
function buildSheet(palette, style) {
  const png = new PNG({ width: W * FRAMES, height: H });
  for (let f = 0; f < FRAMES; f++) drawFrame(png, f * W, f, palette, style);
  return png;
}

const PALETTES = {
  player: {
    skin: [255, 219, 172, 255],
    hair: [45, 52, 70, 255],
    shirt: [61, 141, 253, 255],
    pants: [44, 62, 80, 255],
    shoes: [30, 30, 40, 255],
    accent: [244, 211, 94, 255],
  },
  bot: {
    skin: [255, 219, 172, 255],
    hair: [80, 55, 35, 255],
    shirt: [46, 204, 113, 255],
    pants: [39, 87, 66, 255],
    shoes: [25, 50, 35, 255],
    accent: [200, 255, 220, 255],
  },
  npc: {
    skin: [255, 210, 160, 255],
    hair: [120, 40, 40, 255],
    shirt: [231, 76, 60, 255],
    pants: [90, 50, 50, 255],
    shoes: [50, 30, 30, 255],
    accent: [255, 180, 80, 255],
  },
  remote: {
    skin: [255, 219, 172, 255],
    hair: [90, 60, 140, 255],
    shirt: [155, 89, 182, 255],
    pants: [70, 50, 100, 255],
    shoes: [40, 30, 60, 255],
    accent: [200, 160, 255, 255],
  },
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const [name, palette] of Object.entries(PALETTES)) {
    const png = buildSheet(palette, name);
    const outPath = path.join(OUT, `${name}.png`);
    await new Promise((resolve, reject) => {
      png
        .pack()
        .pipe(fs.createWriteStream(outPath))
        .on('finish', resolve)
        .on('error', reject);
    });
    console.log(`✓ ${outPath} (${png.width}×${png.height})`);
  }

  console.log('\nSprites de exemplo listos. Recarga o xogo (Ctrl+F5).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
