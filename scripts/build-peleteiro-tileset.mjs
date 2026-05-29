/**
 * Tileset 16×16 estilo Pokémon GBA para interiores Peleteiro.
 * Uso: node scripts/build-peleteiro-tileset.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'assets', 'tilesets', 'peleteiro.png');

export const TILE = 16;
export const COLS = 8;
export const FRAME_COUNT = 40;

/** @param {PNG} png @param {number} ox tile origin x @param {number} oy tile origin y */
function px(png, ox, oy, x, y, rgba) {
  const gx = ox + x;
  const gy = oy + y;
  if (gx < 0 || gy < 0 || gx >= png.width || gy >= png.height) return;
  const i = (png.width * gy + gx) << 2;
  png.data[i] = rgba[0];
  png.data[i + 1] = rgba[1];
  png.data[i + 2] = rgba[2];
  png.data[i + 3] = rgba[3] ?? 255;
}

function rect(png, ox, oy, x, y, w, h, rgba) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) px(png, ox, oy, x + dx, y + dy, rgba);
  }
}

function outline(png, ox, oy, rgba = [40, 32, 24, 255]) {
  for (let x = 0; x < TILE; x++) {
    px(png, ox, oy, x, 0, rgba);
    px(png, ox, oy, x, TILE - 1, rgba);
  }
  for (let y = 0; y < TILE; y++) {
    px(png, ox, oy, 0, y, rgba);
    px(png, ox, oy, TILE - 1, y, rgba);
  }
}

function drawWallOut(png, ox, oy) {
  rect(png, ox, oy, 1, 1, 14, 14, [62, 50, 40, 255]);
  for (let y = 1; y < 15; y += 4) {
    for (let x = 1; x < 15; x += 4) {
      rect(png, ox, oy, x, y, 3, 2, [82, 68, 52, 255]);
      px(png, ox, oy, x + 1, y, [100, 85, 65, 255]);
    }
  }
  rect(png, ox, oy, 0, 0, 16, 2, [48, 38, 30, 255]);
  outline(png, ox, oy, [32, 24, 18, 255]);
}

function drawWallIn(png, ox, oy) {
  rect(png, ox, oy, 1, 1, 14, 14, [96, 104, 112, 255]);
  for (let y = 2; y < 14; y += 3) {
    rect(png, ox, oy, 2, y, 12, 1, [120, 128, 136, 255]);
  }
  rect(png, ox, oy, 0, 0, 16, 1, [72, 78, 86, 255]);
  outline(png, ox, oy, [56, 60, 68, 255]);
}

function drawAsphalt(png, ox, oy, variant) {
  const base = variant ? [92, 100, 108, 255] : [84, 92, 100, 255];
  rect(png, ox, oy, 0, 0, 16, 16, base);
  const specks = variant ? [78, 86, 94, 255] : [70, 78, 86, 255];
  for (let i = 0; i < 12; i++) {
    const x = (i * 5 + variant * 3) % 14 + 1;
    const y = (i * 7 + variant) % 14 + 1;
    px(png, ox, oy, x, y, specks);
    px(png, ox, oy, x + 1, y, [100, 108, 116, 255]);
  }
  rect(png, ox, oy, 0, 14, 16, 2, [68, 74, 80, 255]);
}

function drawSidewalk(png, ox, oy) {
  rect(png, ox, oy, 0, 4, 16, 12, [118, 126, 132, 255]);
  rect(png, ox, oy, 0, 0, 16, 5, [74, 82, 88, 255]);
  for (let x = 1; x < 15; x += 3) {
    rect(png, ox, oy, x, 1, 2, 2, [88, 96, 102, 255]);
  }
  rect(png, ox, oy, 0, 4, 16, 1, [96, 104, 110, 255]);
}

function drawBuilding(png, ox, oy, withWindow) {
  rect(png, ox, oy, 0, 0, 16, 16, [140, 152, 164, 255]);
  rect(png, ox, oy, 0, 0, 16, 2, [110, 120, 132, 255]);
  rect(png, ox, oy, 0, 14, 16, 2, [90, 98, 108, 255]);
  if (withWindow) {
    rect(png, ox, oy, 4, 5, 8, 7, [56, 72, 88, 255]);
    rect(png, ox, oy, 5, 6, 6, 5, [144, 200, 232, 255]);
    px(png, ox, oy, 5, 6, [200, 230, 255, 255]);
    rect(png, ox, oy, 4, 5, 8, 1, [40, 50, 60, 255]);
    rect(png, ox, oy, 4, 11, 8, 1, [40, 50, 60, 255]);
  } else {
    rect(png, ox, oy, 3, 6, 10, 1, [120, 130, 142, 255]);
    rect(png, ox, oy, 3, 10, 10, 1, [120, 130, 142, 255]);
  }
  outline(png, ox, oy, [70, 78, 88, 255]);
}

function drawFloor(png, ox, oy, alt) {
  const c = alt ? [188, 194, 200, 255] : [176, 182, 190, 255];
  rect(png, ox, oy, 0, 0, 16, 16, c);
  rect(png, ox, oy, 0, 0, 16, 1, [156, 162, 170, 255]);
  rect(png, ox, oy, 0, 15, 16, 1, [140, 146, 154, 255]);
  if (alt) {
    px(png, ox, oy, 4, 8, [168, 174, 182, 255]);
    px(png, ox, oy, 12, 4, [168, 174, 182, 255]);
  }
}

function drawFire(png, ox, oy) {
  drawWallIn(png, ox, oy);
  rect(png, ox, oy, 10, 6, 4, 8, [192, 48, 32, 255]);
  rect(png, ox, oy, 11, 7, 2, 6, [220, 64, 48, 255]);
  px(png, ox, oy, 11, 5, [255, 220, 80, 255]);
  px(png, ox, oy, 12, 5, [255, 200, 60, 255]);
}

function drawLocker(png, ox, oy) {
  drawWallIn(png, ox, oy);
  rect(png, ox, oy, 3, 4, 10, 10, [120, 80, 48, 255]);
  rect(png, ox, oy, 4, 5, 8, 8, [96, 64, 40, 255]);
  rect(png, ox, oy, 7, 4, 2, 10, [72, 48, 32, 255]);
  px(png, ox, oy, 8, 9, [200, 180, 120, 255]);
}

/** Escalera GBA: peldaños horizontales, sensación de subida (step 0=arriba). */
function drawStairUp(png, ox, oy, step) {
  const sky = [148, 156, 168, 255];
  rect(png, ox, oy, 0, 0, 16, 16, sky);
  const rise = step * 2;
  for (let s = 0; s <= step; s++) {
    const y = 12 - s * 3 - rise + step * 2;
    const shade = s === step ? [200, 208, 216, 255] : [168, 176, 186, 255];
    const edge = s === step ? [140, 148, 158, 255] : [120, 128, 138, 255];
    rect(png, ox, oy, 1, Math.max(2, y), 14, 2, shade);
    rect(png, ox, oy, 1, Math.max(2, y) + 2, 14, 1, edge);
  }
  rect(png, ox, oy, 0, 14, 16, 2, [96, 104, 112, 255]);
  if (step === 0) {
    rect(png, ox, oy, 6, 1, 4, 2, [255, 240, 180, 255]);
  }
}

function drawStairDown(png, ox, oy, step) {
  rect(png, ox, oy, 0, 0, 16, 16, [148, 156, 168, 255]);
  for (let s = 0; s <= step; s++) {
    const y = 4 + s * 3;
    const shade = s === step ? [200, 208, 216, 255] : [168, 176, 186, 255];
    rect(png, ox, oy, 1, y, 14, 2, shade);
    rect(png, ox, oy, 1, y + 2, 14, 1, [120, 128, 138, 255]);
  }
  rect(png, ox, oy, 0, 0, 16, 2, [96, 104, 112, 255]);
}

function drawDoor(png, ox, oy) {
  drawAsphalt(png, ox, oy, 0);
  rect(png, ox, oy, 3, 2, 10, 13, [100, 68, 40, 255]);
  rect(png, ox, oy, 4, 3, 8, 11, [120, 82, 48, 255]);
  rect(png, ox, oy, 4, 3, 8, 1, [80, 54, 32, 255]);
  px(png, ox, oy, 10, 9, [255, 210, 80, 255]);
  rect(png, ox, oy, 2, 1, 12, 2, [72, 50, 32, 255]);
}

function drawCasita(png, ox, oy) {
  rect(png, ox, oy, 0, 8, 16, 8, [160, 48, 40, 255]);
  rect(png, ox, oy, 1, 9, 14, 6, [192, 56, 48, 255]);
  rect(png, ox, oy, 0, 2, 16, 7, [140, 32, 28, 255]);
  rect(png, ox, oy, 2, 0, 12, 4, [180, 48, 40, 255]);
  rect(png, ox, oy, 6, 10, 4, 5, [80, 56, 40, 255]);
  rect(png, ox, oy, 11, 9, 3, 3, [144, 200, 232, 255]);
}

function drawPalmPot(png, ox, oy) {
  drawAsphalt(png, ox, oy, 1);
  rect(png, ox, oy, 3, 10, 10, 5, [140, 96, 72, 255]);
  rect(png, ox, oy, 4, 11, 8, 3, [168, 120, 88, 255]);
  px(png, ox, oy, 5, 12, [200, 160, 120, 255]);
}

function drawPalmTrunk(png, ox, oy) {
  drawAsphalt(png, ox, oy, 0);
  rect(png, ox, oy, 7, 6, 2, 9, [100, 72, 48, 255]);
  px(png, ox, oy, 8, 7, [120, 88, 56, 255]);
}

function drawPalmLeaf(png, ox, oy) {
  drawAsphalt(png, ox, oy, 1);
  rect(png, ox, oy, 7, 8, 2, 6, [100, 72, 48, 255]);
  px(png, ox, oy, 8, 4, [32, 96, 48, 255]);
  px(png, ox, oy, 6, 5, [40, 112, 56, 255]);
  px(png, ox, oy, 10, 5, [40, 112, 56, 255]);
  px(png, ox, oy, 5, 6, [48, 120, 60, 255]);
  px(png, ox, oy, 11, 6, [48, 120, 60, 255]);
  px(png, ox, oy, 7, 3, [56, 128, 64, 255]);
  px(png, ox, oy, 9, 3, [56, 128, 64, 255]);
  px(png, ox, oy, 8, 2, [64, 140, 72, 255]);
}

/** Mobiliario estilo Pokémon GBA (vista cenital / 3/4). */
function drawCarpet(png, ox, oy, variant) {
  drawFloor(png, ox, oy, variant);
  const base = variant ? [168, 72, 72, 255] : [192, 88, 88, 255];
  const dark = variant ? [140, 56, 56, 255] : [160, 72, 72, 255];
  const light = variant ? [200, 104, 104, 255] : [220, 120, 120, 255];
  rect(png, ox, oy, 2, 3, 12, 10, base);
  for (let y = 3; y < 13; y += 2) {
    for (let x = 2; x < 14; x += 2) {
      rect(png, ox, oy, x, y, 2, 1, dark);
      px(png, ox, oy, x + 1, y, light);
    }
  }
  rect(png, ox, oy, 1, 2, 14, 1, dark);
  rect(png, ox, oy, 1, 13, 14, 1, dark);
  rect(png, ox, oy, 1, 2, 1, 12, dark);
  rect(png, ox, oy, 14, 2, 1, 12, dark);
  px(png, ox, oy, 7, 7, [255, 220, 160, 255]);
  px(png, ox, oy, 8, 8, [255, 230, 180, 255]);
}

function drawChair(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 4, 3, 8, 3, [96, 64, 40, 255]);
  rect(png, ox, oy, 5, 4, 6, 1, [120, 82, 52, 255]);
  rect(png, ox, oy, 3, 6, 10, 6, [112, 76, 48, 255]);
  rect(png, ox, oy, 4, 7, 8, 4, [136, 96, 60, 255]);
  rect(png, ox, oy, 5, 11, 2, 3, [72, 48, 32, 255]);
  rect(png, ox, oy, 9, 11, 2, 3, [72, 48, 32, 255]);
  px(png, ox, oy, 7, 8, [160, 112, 72, 255]);
}

function drawStudentDesk(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 2, 5, 12, 7, [136, 96, 56, 255]);
  rect(png, ox, oy, 3, 6, 10, 5, [160, 112, 64, 255]);
  rect(png, ox, oy, 3, 6, 10, 1, [184, 136, 80, 255]);
  rect(png, ox, oy, 5, 8, 6, 3, [248, 244, 232, 255]);
  px(png, ox, oy, 6, 9, [224, 216, 200, 255]);
  rect(png, ox, oy, 4, 12, 3, 3, [96, 64, 40, 255]);
  rect(png, ox, oy, 9, 12, 3, 3, [96, 64, 40, 255]);
  rect(png, ox, oy, 3, 4, 10, 2, [112, 76, 48, 255]);
}

function drawTeacherDesk(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 1, 5, 14, 8, [104, 68, 40, 255]);
  rect(png, ox, oy, 2, 6, 12, 6, [128, 88, 52, 255]);
  rect(png, ox, oy, 2, 6, 12, 1, [152, 108, 64, 255]);
  rect(png, ox, oy, 4, 8, 8, 2, [248, 244, 232, 255]);
  rect(png, ox, oy, 10, 7, 3, 4, [64, 64, 72, 255]);
  rect(png, ox, oy, 11, 8, 1, 2, [120, 200, 255, 255]);
  rect(png, ox, oy, 3, 3, 10, 3, [88, 56, 32, 255]);
}

function drawBookshelf(png, ox, oy) {
  drawWallIn(png, ox, oy);
  rect(png, ox, oy, 2, 2, 12, 12, [120, 80, 48, 255]);
  for (let y = 4; y < 13; y += 4) {
    rect(png, ox, oy, 3, y, 10, 1, [88, 56, 32, 255]);
    rect(png, ox, oy, 4, y + 1, 2, 2, [200, 64, 64, 255]);
    rect(png, ox, oy, 7, y + 1, 2, 2, [64, 120, 200, 255]);
    rect(png, ox, oy, 10, y + 1, 2, 2, [96, 160, 80, 255]);
  }
}

function drawDisplayCase(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 2, 2, 12, 12, [96, 104, 112, 255]);
  rect(png, ox, oy, 3, 3, 10, 10, [176, 220, 248, 180]);
  rect(png, ox, oy, 3, 3, 10, 1, [120, 160, 200, 220]);
  rect(png, ox, oy, 4, 6, 3, 4, [220, 180, 80, 255]);
  rect(png, ox, oy, 8, 7, 4, 3, [200, 80, 80, 255]);
  rect(png, ox, oy, 5, 10, 6, 2, [140, 100, 72, 255]);
  px(png, ox, oy, 4, 4, [220, 240, 255, 200]);
}

function drawBlackboard(png, ox, oy) {
  drawWallIn(png, ox, oy);
  rect(png, ox, oy, 2, 3, 12, 9, [48, 88, 56, 255]);
  rect(png, ox, oy, 3, 4, 10, 7, [56, 104, 64, 255]);
  rect(png, ox, oy, 4, 6, 6, 1, [220, 220, 200, 200]);
  px(png, ox, oy, 5, 8, [220, 220, 200, 180]);
  px(png, ox, oy, 8, 7, [220, 220, 200, 180]);
  rect(png, ox, oy, 1, 12, 14, 2, [96, 64, 40, 255]);
  rect(png, ox, oy, 13, 10, 2, 4, [240, 240, 248, 255]);
}

function drawBench(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 1, 6, 14, 4, [136, 96, 56, 255]);
  rect(png, ox, oy, 2, 7, 12, 2, [160, 112, 64, 255]);
  rect(png, ox, oy, 2, 10, 2, 4, [96, 64, 40, 255]);
  rect(png, ox, oy, 12, 10, 2, 4, [96, 64, 40, 255]);
  rect(png, ox, oy, 1, 5, 14, 1, [112, 76, 48, 255]);
}

function drawComputerDesk(png, ox, oy) {
  drawStudentDesk(png, ox, oy);
  rect(png, ox, oy, 9, 4, 5, 5, [72, 72, 80, 255]);
  rect(png, ox, oy, 10, 5, 3, 3, [144, 200, 240, 255]);
  px(png, ox, oy, 11, 6, [200, 230, 255, 255]);
  rect(png, ox, oy, 10, 9, 4, 1, [96, 96, 104, 255]);
}

function drawPlantIndoor(png, ox, oy) {
  drawFloor(png, ox, oy, 0);
  rect(png, ox, oy, 5, 10, 6, 4, [140, 96, 72, 255]);
  rect(png, ox, oy, 6, 11, 4, 2, [168, 120, 88, 255]);
  rect(png, ox, oy, 7, 4, 2, 7, [80, 120, 56, 255]);
  px(png, ox, oy, 6, 3, [48, 104, 48, 255]);
  px(png, ox, oy, 9, 4, [56, 112, 56, 255]);
  px(png, ox, oy, 8, 2, [64, 128, 64, 255]);
}

function drawLibraryCarpet(png, ox, oy) {
  const base = [72, 108, 168, 255];
  const alt = [64, 98, 158, 255];
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      px(png, ox, oy, x, y, (x + y) % 2 ? base : alt);
    }
  }
  rect(png, ox, oy, 2, 2, 12, 1, [88, 128, 192, 255]);
}

function drawCryptFloor(png, ox, oy) {
  rect(png, ox, oy, 0, 0, 16, 16, [48, 44, 62, 255]);
  for (let i = 0; i < 8; i++) {
    px(png, ox, oy, 2 + i * 2, 4 + (i % 3), [72, 68, 88, 255]);
    px(png, ox, oy, 3 + i, 10 + (i % 2), [36, 32, 48, 255]);
  }
}

function drawCryptFog(png, ox, oy) {
  drawCryptFloor(png, ox, oy);
  for (let y = 2; y < 14; y++) {
    for (let x = 2; x < 14; x++) {
      if ((x * y + x) % 5 === 0) px(png, ox, oy, x, y, [120, 140, 160, 140]);
    }
  }
}

function drawSkeletonProp(png, ox, oy) {
  drawCryptFloor(png, ox, oy);
  rect(png, ox, oy, 7, 5, 2, 8, [220, 220, 230, 255]);
  rect(png, ox, oy, 5, 6, 6, 2, [220, 220, 230, 255]);
  px(png, ox, oy, 8, 4, [200, 40, 40, 255]);
  rect(png, ox, oy, 6, 13, 4, 2, [200, 200, 210, 255]);
}

function drawWisp(png, ox, oy) {
  drawCryptFloor(png, ox, oy);
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 12; x++) {
      const d = Math.abs(x - 8) + Math.abs(y - 8);
      if (d < 5) px(png, ox, oy, x, y, [160, 220, 255, 180 + d * 10]);
    }
  }
  px(png, ox, oy, 8, 7, [240, 255, 255, 255]);
}

const PAINTERS = [
  drawWallOut,
  drawWallIn,
  (p, x, y) => drawAsphalt(p, x, y, 0),
  (p, x, y) => drawAsphalt(p, x, y, 1),
  drawSidewalk,
  (p, x, y) => drawBuilding(p, x, y, false),
  (p, x, y) => drawBuilding(p, x, y, true),
  (p, x, y) => drawFloor(p, x, y, 0),
  (p, x, y) => drawFloor(p, x, y, 1),
  drawFire,
  drawLocker,
  (p, x, y) => drawStairUp(p, x, y, 0),
  (p, x, y) => drawStairUp(p, x, y, 1),
  (p, x, y) => drawStairUp(p, x, y, 2),
  (p, x, y) => drawStairUp(p, x, y, 3),
  (p, x, y) => drawStairDown(p, x, y, 0),
  (p, x, y) => drawStairDown(p, x, y, 1),
  (p, x, y) => drawStairDown(p, x, y, 2),
  (p, x, y) => drawStairDown(p, x, y, 3),
  drawDoor,
  drawCasita,
  drawPalmPot,
  drawPalmTrunk,
  drawPalmLeaf,
  (p, x, y) => drawCarpet(p, x, y, 0),
  (p, x, y) => drawCarpet(p, x, y, 1),
  drawChair,
  drawStudentDesk,
  drawTeacherDesk,
  drawBookshelf,
  drawDisplayCase,
  drawBlackboard,
  drawBench,
  drawComputerDesk,
  drawPlantIndoor,
  drawLibraryCarpet,
  drawCryptFloor,
  drawCryptFog,
  drawSkeletonProp,
  drawWisp,
];

function buildAtlas() {
  const rows = Math.ceil(PAINTERS.length / COLS);
  const png = new PNG({ width: COLS * TILE, height: rows * TILE });
  for (let i = 0; i < PAINTERS.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    PAINTERS[i](png, col * TILE, row * TILE);
  }
  return png;
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const png = buildAtlas();
  await new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(fs.createWriteStream(OUT))
      .on('finish', resolve)
      .on('error', reject);
  });
  console.log(`✓ ${OUT} (${png.width}×${png.height}, ${PAINTERS.length} tiles)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
