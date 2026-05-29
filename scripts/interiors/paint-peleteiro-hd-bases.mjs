/**
 * Pintura procedural HD das zonas Peleteiro (referencia: antigo Colexio Peleteiro / Minerva,
 * Rúa da República Arxentina — patio en U, palmeira na maceta, casiña vermella da portería).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const BUILT = path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'built');
const SOURCE = path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'source');
const TILE = 16;

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

function fill(png, rgba) {
  rect(png, 0, 0, png.width, png.height, rgba);
}

function asphaltTexture(png, x0, y0, w, h, seed = 0) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const n = ((x * 17 + y * 31 + seed) % 7) - 3;
      const base = 88 + n;
      px(png, x, y, [base, base + 4, base + 8, 255]);
      if ((x + y + seed) % 11 === 0) px(png, x, y, [72, 78, 86, 255]);
    }
  }
}

function sidewalkBand(png, x0, y0, w, h) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const c = (x + y) % 3 === 0 ? [148, 142, 132, 255] : [128, 122, 114, 255];
      px(png, x, y, c);
    }
  }
}

function drawFacadeBlock(png, x0, y0, w, h, seed = 0) {
  rect(png, x0, y0, w, h, [186, 178, 168, 255]);
  rect(png, x0, y0, w, 3, [142, 132, 122, 255]);
  rect(png, x0, y0 + h - 4, w, 4, [120, 112, 104, 255]);
  const winW = 10;
  const winH = 12;
  const gapX = 14;
  const gapY = 16;
  for (let wy = y0 + 8; wy < y0 + h - 12; wy += gapY) {
    for (let wx = x0 + 6; wx < x0 + w - 8; wx += gapX) {
      if (wx + winW >= x0 + w || wy + winH >= y0 + h) continue;
      if ((wx + wy + seed) % 19 === 0) continue;
      rect(png, wx, wy, winW, winH, [52, 68, 88, 255]);
      rect(png, wx + 1, wy + 1, winW - 2, winH - 2, [168, 208, 240, 255]);
      rect(png, wx, wy + winH - 1, winW, 1, [40, 50, 60, 255]);
    }
  }
}

function drawPalm(png, cx, cy) {
  const potY = cy + 28;
  rect(png, cx - 22, potY, 44, 18, [132, 88, 64, 255]);
  rect(png, cx - 18, potY + 2, 36, 14, [168, 112, 80, 255]);
  rect(png, cx - 4, potY - 38, 8, 42, [96, 68, 44, 255]);
  const greens = [
    [48, 120, 56, 255],
    [56, 140, 64, 255],
    [40, 100, 48, 255],
  ];
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const lx = cx + Math.cos(angle) * 38 - 8;
    const ly = cy - 20 + Math.sin(angle) * 22;
    const g = greens[i % 3];
    for (let dy = 0; dy < 20; dy++) {
      for (let dx = 0; dx < 16; dx++) {
        if (dx * dx + dy * dy < 90) px(png, Math.floor(lx + dx), Math.floor(ly + dy), g);
      }
    }
  }
  rect(png, cx - 10, cy - 8, 20, 14, [64, 140, 72, 255]);
}

function drawCasitaVermella(png, x0, y0) {
  const w = 80;
  const h = 64;
  rect(png, x0, y0 + 20, w, h - 20, [168, 48, 40, 255]);
  rect(png, x0 + 4, y0 + 24, w - 8, h - 28, [192, 60, 50, 255]);
  for (let i = 0; i < w; i++) {
    const peak = Math.abs(i - w / 2) * 0.35;
    rect(png, x0 + i, y0 + Math.floor(peak), 1, 22 - Math.floor(peak), [140, 36, 30, 255]);
  }
  rect(png, x0 + 30, y0 + 38, 18, 28, [64, 44, 36, 255]);
  rect(png, x0 + 52, y0 + 42, 12, 10, [200, 220, 255, 255]);
}

function paintPatio() {
  const W = 58 * TILE;
  const H = 44 * TILE;
  const png = new PNG({ width: W, height: H });

  fill(png, [72, 78, 86, 255]);
  asphaltTexture(png, 11 * TILE, 11 * TILE, 36 * TILE, 30 * TILE, 1);

  const x0 = 11 * TILE;
  const x1 = 46 * TILE;
  const y0 = 11 * TILE;
  const y1 = 40 * TILE;
  sidewalkBand(png, x0, y0, x1 - x0, 3);
  sidewalkBand(png, x0, y1 - 2, x1 - x0, 3);
  sidewalkBand(png, x0, y0, 3, y1 - y0);
  sidewalkBand(png, x1 - 3, y0, 3, y1 - y0);

  drawFacadeBlock(png, 2 * TILE, 8 * TILE, 9 * TILE, 34 * TILE, 2);
  drawFacadeBlock(png, 47 * TILE, 6 * TILE, 9 * TILE, 36 * TILE, 3);
  drawFacadeBlock(png, 2 * TILE, 2 * TILE, 52 * TILE, 8 * TILE, 4);

  drawPalm(png, 42 * TILE, 30 * TILE);
  drawCasitaVermella(png, 40 * TILE, 20 * TILE);

  for (let y = 6 * TILE; y < 10 * TILE; y++) {
    for (let x = 24 * TILE; x < 33 * TILE; x++) {
      const step = Math.floor((y - 6 * TILE) / 8);
      px(png, x, y, [168 + step * 8, 176 + step * 8, 188 + step * 8, 255]);
    }
  }

  return png;
}

function inLibrary(tx, ty) {
  return tx >= 8 && tx <= 30 && ty >= 8 && ty <= 22;
}

function inCrypt(tx, ty) {
  const wing =
    (tx >= 8 && tx <= 30 && ty >= 8 && ty <= 22) ||
    (tx >= 46 && tx <= 68 && ty >= 8 && ty <= 22) ||
    (tx >= 8 && tx <= 30 && ty >= 30 && ty <= 44) ||
    (tx >= 46 && tx <= 68 && ty >= 30 && ty <= 44);
  return wing;
}

function paintInteriorFloor(floor) {
  const W = 76 * TILE;
  const H = 52 * TILE;
  const png = new PNG({ width: W, height: H });
  const wall = floor === 3 ? [72, 68, 88, 255] : [108, 116, 124, 255];
  const isCrypt = floor === 3;
  const isLib = floor === 1;

  for (let ty = 0; ty < 52; ty++) {
    for (let tx = 0; tx < 76; tx++) {
      const x = tx * TILE;
      const y = ty * TILE;
      const edge = tx < 7 || tx > 68 || ty < 7 || ty > 44;
      if (edge) {
        rect(png, x, y, TILE, TILE, wall);
        continue;
      }
      const inCorridor = tx >= 33 && tx < 42 && ty >= 8 && ty < 44;
      const wing =
        (tx >= 8 && tx <= 30 && ty >= 8 && ty <= 22) ||
        (tx >= 46 && tx <= 68 && ty >= 8 && ty <= 22) ||
        (tx >= 8 && tx <= 30 && ty >= 30 && ty <= 44) ||
        (tx >= 46 && tx <= 68 && ty >= 30 && ty <= 44);
      const fire =
        !isCrypt &&
        !isLib &&
        wing &&
        ((tx >= 9 && tx <= 29 && ty >= 9 && ty <= 21) ||
          (tx >= 47 && tx <= 67 && ty >= 9 && ty <= 21) ||
          (tx >= 9 && tx <= 29 && ty >= 31 && ty <= 43) ||
          (tx >= 47 && tx <= 67 && ty >= 31 && ty <= 43));
      const fireClass =
        !isCrypt &&
        wing &&
        floor === 2 &&
        ((tx >= 9 && tx <= 29 && ty >= 9 && ty <= 21) ||
          (tx >= 47 && tx <= 67 && ty >= 9 && ty <= 21) ||
          (tx >= 9 && tx <= 29 && ty >= 31 && ty <= 43) ||
          (tx >= 47 && tx <= 67 && ty >= 31 && ty <= 43));

      if (isLib && inLibrary(tx, ty)) {
        const c = (tx + ty) % 2 ? [72, 108, 168, 255] : [64, 98, 158, 255];
        rect(png, x, y, TILE, TILE, c);
      } else if (isCrypt && inCrypt(tx, ty)) {
        const fog = (tx + ty) % 3 === 0;
        const c = fog ? [56, 52, 72, 255] : [44, 40, 58, 255];
        rect(png, x, y, TILE, TILE, c);
        if (fog && (tx + ty) % 5 === 0) rect(png, x + 3, y + 2, 10, 10, [100, 120, 150, 120]);
      } else if (inCorridor) {
        rect(png, x, y, TILE, TILE, [(ty + tx) % 2 ? 172 : 162, (ty + tx) % 2 ? 178 : 168, (ty + tx) % 2 ? 186 : 176, 255]);
      } else if (fire || fireClass) {
        const flicker = (tx * 13 + ty * 7 + floor) % 5;
        rect(png, x, y, TILE, TILE, [140 + flicker, 100 + flicker, 80 + flicker, 255]);
        if ((tx + ty) % 4 === 0) rect(png, x + 4, y + 4, 8, 8, [200, 80, 40, 255]);
      } else if (wing) {
        const c = (tx + ty) % 2 ? [148, 132, 118, 255] : [132, 118, 104, 255];
        rect(png, x, y, TILE, TILE, c);
      } else {
        rect(png, x, y, TILE, TILE, [120, 126, 134, 255]);
      }
    }
  }

  for (let ty = 8; ty < 44; ty++) {
    for (let tx = 33; tx < 42; tx++) {
      if (ty >= 12 && ty <= 20) continue;
      const x = tx * TILE;
      const y = ty * TILE;
      rect(png, x + 2, y + 2, 12, 12, [148, 156, 168, 255]);
    }
  }

  const stairX = 34 * TILE;
  for (let s = 0; s < 4; s++) {
    rect(png, stairX, (40 - s) * TILE + 8, 8 * TILE, 3, [180 + s * 10, 188 + s * 10, 200 + s * 10, 255]);
  }
  if (floor > 1) {
    for (let s = 0; s < 4; s++) {
      rect(png, stairX, (7 + s) * TILE, 8 * TILE, 3, [180 + s * 10, 188 + s * 10, 200 + s * 10, 255]);
    }
  }

  rect(png, 12 * TILE, 12 * TILE, 16 * TILE, 8 * TILE, [96, 72, 48, 255]);
  rect(png, 50 * TILE, 12 * TILE, 16 * TILE, 8 * TILE, [96, 72, 48, 255]);
  rect(png, 12 * TILE, 32 * TILE, 16 * TILE, 8 * TILE, [96, 72, 48, 255]);
  rect(png, 50 * TILE, 32 * TILE, 16 * TILE, 8 * TILE, [96, 72, 48, 255]);

  return png;
}

function writeZone(png, zoneKey) {
  const dir = path.join(BUILT, zoneKey);
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, 'base.png');
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`  ✓ ${zoneKey} ${png.width}×${png.height}`);
}

export function buildPatioBasePng() {
  return paintPatio();
}

export function buildFloorBasePng(floor) {
  return paintInteriorFloor(floor);
}

export function writePeleteiroBase(png, zoneKey) {
  writeZone(png, zoneKey);
}

export async function paintAllPeleteiroBases() {
  console.log('Peleteiro — pintura HD (referencia antigo Peleteiro / Minerva)\n');
  writeZone(paintPatio(), 'patio');
  for (let f = 1; f <= 3; f++) {
    writeZone(paintInteriorFloor(f), `floor-${f}`);
  }
  console.log('✓ bases HD → public/assets/interiors/peleteiro/built/*/base.png');
}

async function main() {
  await paintAllPeleteiroBases();
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
