import { fillGrid, rect, createLayout } from '../layout-utils.js';

/** ~500 m × 500 m (≈8 m por tile) */
const SIZE = 62;
const TILE = 16;
const WALL = 1;
const RING = 10;
const PARK0 = WALL + RING;
const PARK1 = SIZE - WALL - RING - 1;

const COLORS = {
  '#': 0xc8c4bc,
  '.': 0xe8e4dc,
  G: 0x7cb342,
  g: 0x689f38,
  T: 0x2e7d32,
  S: 0x546e7a,
  s: 0x78909c,
  F: 0x4fc3f7,
  D: 0x8b6914,
  P: 0xbcaaa4,
};

/** Posicións para cidadáns verdes nas galerías (anel interior) */
export const AREA_CENTRAL_SHOPPER_SLOTS = (() => {
  const slots = [];
  const ringYs = [PARK0 - 3, PARK0 - 4, PARK1 + 3, PARK1 + 4, WALL + 4, SIZE - WALL - 5];
  const ringXs = [PARK0 - 3, PARK1 + 3, WALL + 4, SIZE - WALL - 5];
  for (const y of ringYs) {
    for (let x = PARK0; x <= PARK1; x += 4) {
      slots.push({ tx: x, ty: y, id: `ac-shop-${slots.length}` });
    }
  }
  for (const x of ringXs) {
    for (let y = PARK0; y <= PARK1; y += 4) {
      slots.push({ tx: x, ty: y, id: `ac-shop-${slots.length}` });
    }
  }
  return slots.slice(0, 28);
})();

export function buildAreaCentralLayout() {
  const g = fillGrid(SIZE, SIZE, '#');

  rect(g, SIZE, SIZE, WALL, WALL, SIZE - WALL - 1, SIZE - WALL - 1, '.');
  rect(g, SIZE, SIZE, PARK0, PARK0, PARK1, PARK1, 'G');

  for (let y = PARK0 + 2; y <= PARK1 - 2; y += 5) {
    for (let x = PARK0 + 2; x <= PARK1 - 2; x += 6) {
      if ((x + y) % 7 === 0) g[y][x] = 'T';
    }
  }
  g[Math.floor((PARK0 + PARK1) / 2)][Math.floor((PARK0 + PARK1) / 2)] = 'F';
  g[Math.floor((PARK0 + PARK1) / 2) + 1][Math.floor((PARK0 + PARK1) / 2)] = 'g';

  function placeShopRow(y, x0, x1, step = 3) {
    for (let x = x0; x <= x1; x += step) {
      if (g[y][x] === '.') g[y][x] = 'S';
      if (g[y][x] === 'S' && g[y - 1]?.[x] === '.') g[y - 1][x] = 's';
      if (g[y][x] === 'S' && g[y + 1]?.[x] === '.') g[y + 1][x] = 's';
    }
  }

  placeShopRow(PARK0 - 1, PARK0, PARK1, 3);
  placeShopRow(PARK1 + 1, PARK0, PARK1, 3);
  for (let y = PARK0; y <= PARK1; y += 3) {
    if (g[y][PARK0 - 1] === '.') g[y][PARK0 - 1] = 'S';
    if (g[y][PARK1 + 1] === '.') g[y][PARK1 + 1] = 'S';
  }

  for (let x = WALL + 2; x < SIZE - WALL - 2; x += 5) {
    if (g[WALL + 2][x] === '.') g[WALL + 2][x] = 'P';
    if (g[SIZE - WALL - 3][x] === '.') g[SIZE - WALL - 3][x] = 'P';
  }

  const entryTx = Math.floor(SIZE / 2);
  const entryTy = SIZE - WALL - 3;
  g[SIZE - WALL - 1][entryTx] = 'D';
  g[SIZE - WALL - 2][entryTx] = 'D';
  g[SIZE - WALL - 3][entryTx] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: TILE,
    rows,
    colors: COLORS,
    blocked: ['#', 'S', 's', 'T', 'P'],
    entry: { tx: entryTx, ty: entryTy },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'S' || ch === 's') {
        gfx.fillStyle(0xffffff, 0.45);
        gfx.fillRect(x + 2, y + 2, tileSize - 4, 4);
        gfx.fillStyle(0x37474f, 0.35);
        gfx.fillRect(x + 3, y + 8, tileSize - 6, tileSize - 9);
      }
      if (ch === 'G' || ch === 'g') {
        gfx.fillStyle(0xffffff, 0.08);
        gfx.fillRect(x + 1, y + 1, tileSize - 2, 2);
      }
      if (ch === 'T') {
        gfx.fillStyle(0x1b5e20, 1);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2 - 2, 4);
        gfx.fillStyle(0x33691e, 1);
        gfx.fillRect(x + tileSize / 2 - 1, y + tileSize / 2, 2, 5);
      }
      if (ch === 'F') {
        gfx.fillStyle(0x4fc3f7, 0.5);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, 5);
      }
      if (ch === 'P') {
        gfx.fillStyle(0x8d6e63, 0.35);
        gfx.fillRect(x + 2, y + tileSize - 5, tileSize - 4, 3);
      }
    },
  });
}
