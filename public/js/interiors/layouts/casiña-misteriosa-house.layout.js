import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 56;
const H = 38;

const CORR_Y0 = 16;
const CORR_Y1 = 18;
const CORR_X0 = 14;
const CORR_X1 = 46;

function room(g, x0, y0, x1, y1, door) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const edge = x === x0 || x === x1 || y === y0 || y === y1;
      if (!edge) {
        g[y][x] = '.';
        continue;
      }
      const isDoor =
        door &&
        ((door.side === 'n' && y === y0 && x >= door.x0 && x <= door.x1) ||
          (door.side === 's' && y === y1 && x >= door.x0 && x <= door.x1) ||
          (door.side === 'w' && x === x0 && y >= door.y0 && y <= door.y1) ||
          (door.side === 'e' && x === x1 && y >= door.y0 && y <= door.y1));
      g[y][x] = isDoor ? '.' : 'h';
    }
  }
}

function furnishBedroom(g, x0, y0, x1, y1) {
  const cx = Math.floor((x0 + x1) / 2);
  g[y0 + 2][cx] = 'b';
  g[y1 - 2][cx - 1] = 'c';
  g[y1 - 2][cx + 1] = 'c';
}

function paintNorthStairs(g, x0, y0, char) {
  for (let y = y0; y < y0 + 3; y++) {
    for (let x = x0; x < x0 + 6; x++) g[y][x] = char;
  }
}

export function buildCasinaMisteriosaHouseLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 3, 3, W - 4, H - 4, '.');

  for (let x = 3; x <= W - 4; x++) {
    g[3][x] = 'h';
    g[H - 4][x] = 'h';
  }
  for (let y = 3; y <= H - 4; y++) {
    g[y][3] = 'h';
    g[y][W - 4] = 'h';
  }

  rect(g, W, H, CORR_X0, CORR_Y0, CORR_X1, CORR_Y1, '.');
  rect(g, W, H, 42, CORR_Y0, 48, CORR_Y1, '.');

  room(g, 3, 10, 13, 22, { side: 'e', y0: 15, y1: 17 });
  rect(g, W, H, 5, 12, 11, 14, 'K');
  g[18][7] = 'M';
  g[14][5] = 'F';

  room(g, 15, 4, 21, 13, { side: 's', x0: 17, x1: 19 });
  furnishBedroom(g, 15, 4, 21, 13);

  room(g, 23, 4, 29, 13, { side: 's', x0: 25, x1: 27 });
  furnishBedroom(g, 23, 4, 29, 13);

  room(g, 31, 4, 37, 13, { side: 's', x0: 33, x1: 35 });
  furnishBedroom(g, 31, 4, 37, 13);

  room(g, 8, 21, 24, 33, { side: 'n', x0: 14, x1: 18 });
  rect(g, W, H, 10, 24, 20, 30, 'R');
  g[22][16] = 'P';
  g[28][12] = 'S';
  g[28][20] = 'S';

  room(g, 26, 21, 32, 30, { side: 'n', x0: 28, x1: 30 });
  furnishBedroom(g, 26, 21, 32, 30);

  room(g, 34, 21, 40, 30, { side: 'n', x0: 36, x1: 38 });
  furnishBedroom(g, 34, 21, 40, 30);

  room(g, 42, 21, 48, 30, { side: 'n', x0: 44, x1: 46 });
  furnishBedroom(g, 42, 21, 48, 30);

  for (let y = H - 5; y <= H - 3; y++) {
    for (let x = 43; x <= 47; x++) g[y][x] = '.';
  }
  for (let x = 43; x <= 47; x++) g[H - 4][x] = '.';
  g[H - 2][44] = 'D';
  g[H - 2][45] = 'D';
  g[H - 2][46] = 'D';
  g[H - 1][45] = 'D';

  paintNorthStairs(g, 24, 3, 'u');
  rect(g, W, H, 25, 4, 27, 15, '.');
  for (let y = 2; y <= 6; y++) {
    for (let x = 22; x <= 31; x++) {
      if (g[y][x] === 'h' || g[y][x] === '#') g[y][x] = '.';
    }
  }

  const COLORS = {
    '#': 0x120c18,
    '.': 0x3a2f38,
    h: 0x4a3048,
    D: 0x2a1810,
    K: 0x546e7a,
    M: 0x6d4c41,
    R: 0x5d4037,
    P: 0x8d6e63,
    F: 0x78909c,
    b: 0x4e342e,
    c: 0xffe082,
    S: 0x6a1b9a,
    u: 0x33691e,
  };

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'h', 'K', 'M', 'F', 'P', 'b', 'S'],
    entry: { tx: 45, ty: 17 },
    entryFromDown: { tx: 27, ty: 9 },
    exitChar: 'D',
    stairLabels: [
      { x: 27 * 16, y: 5 * 16, text: '↑ Parque (W)' },
    ],
    drawTileExtra(gfx, ch, x, y, ts) {
      if (ch === 'c') {
        gfx.fillStyle(0xffc107, 0.85);
        gfx.fillCircle(x + ts / 2, y + ts / 2 - 2, 3);
        gfx.fillStyle(0xffe082, 0.4);
        gfx.fillCircle(x + ts / 2, y + ts / 2 - 2, 6);
      }
      if (ch === 'P') {
        gfx.fillStyle(0xbf360c, 0.6);
        gfx.fillRect(x + 4, y + 6, ts - 8, ts - 8);
      }
      if (ch === 'u') {
        gfx.fillStyle(0x81c784, 0.35);
        gfx.fillRect(x, y, ts, ts);
      }
    },
  });
}
