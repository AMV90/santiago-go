import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 48;
const H = 40;

function scatterTrees(g) {
  for (let y = 3; y <= H - 8; y += 4) {
    for (let x = 4; x <= W - 5; x += 5) {
      if ((x * 5 + y * 11) % 13 !== 0) continue;
      if (g[y][x] !== 'g') continue;
      g[y][x] = 'T';
    }
  }
  const spots = [
    [10, 8],
    [18, 12],
    [30, 10],
    [36, 16],
    [14, 22],
    [24, 26],
    [34, 28],
    [8, 30],
    [40, 32],
  ];
  for (const [tx, ty] of spots) {
    if (g[ty]?.[tx] === 'g') g[ty][tx] = 'T';
  }
}

function paintSouthStairs(g, x0, y0, char) {
  for (let y = y0; y < y0 + 3; y++) {
    for (let x = x0; x < x0 + 6; x++) g[y][x] = char;
  }
}

export function buildCasinaMisteriosaParqueLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, 'g');
  scatterTrees(g);

  rect(g, W, H, 20, 14, 28, 20, '.');
  g[17][24] = 'n';

  for (let y = 2; y <= 4; y++) {
    for (let x = 18; x <= 30; x++) g[y][x] = 'g';
  }

  paintSouthStairs(g, 21, H - 6, 'v');
  for (let y = H - 7; y <= H - 4; y++) {
    for (let x = 19; x <= 29; x++) {
      if (g[y][x] === '#') g[y][x] = 'g';
    }
  }

  const COLORS = {
    '#': 0x1b5e20,
    g: 0x689f38,
    T: 0x2e7d32,
    '.': 0xc8e6a8,
    n: 0x90a4ae,
    v: 0x33691e,
  };

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'T', 'n'],
    entry: { tx: 24, ty: 18 },
    entryFromUp: { tx: 24, ty: H - 8 },
    exitChar: 'D',
    stairLabels: [{ x: 24 * 16, y: (H - 7) * 16, text: '↓ Casiña (S)' }],
    drawTileExtra(gfx, ch, x, y, ts) {
      if (ch === 'T') {
        gfx.fillStyle(0x1b5e20, 0.95);
        gfx.fillCircle(x + ts / 2, y + ts / 2 - 1, 7);
        gfx.fillStyle(0x33691e, 1);
        gfx.fillRect(x + ts / 2 - 1, y + ts - 5, 2, 5);
      }
      if (ch === 'n') {
        gfx.fillStyle(0xb0bec5, 0.85);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
      if (ch === 'v') {
        gfx.fillStyle(0x558b2f, 0.35);
        gfx.fillRect(x, y, ts, ts);
      }
    },
  });
}
