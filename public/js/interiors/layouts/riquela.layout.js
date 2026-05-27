import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 20;
const H = 48;

const COLORS = {
  '#': 0x1a1020,
  '.': 0x3d2f28,
  B: 0x6b4423,
  S: 0x4a3050,
  L: 0x9b59b6,
  D: 0x8b6914,
  a: 0x2c2438,
};

/** Cantante no escenario (sala grande ao fondo) */
export const RIQUELA_SINGER = {
  id: 'riquela-singer',
  tx: 10,
  ty: 4,
  tint: 0xe8b4ff,
};

export function buildRiquelaLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 1, 1, W - 2, H - 2, '.');

  // Sala grande de concertos (fondo / norte)
  rect(g, W, H, 1, 1, W - 2, 13, '.');
  rect(g, W, H, 5, 2, 15, 5, 'S');
  rect(g, W, H, 2, 6, 7, 6, 'B');
  rect(g, W, H, 6, 1, 14, 1, 'L');
  g[2][10] = 'L';
  g[2][11] = 'L';

  // Pasillo longo (estreito)
  for (let y = 14; y <= 38; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (x < 5 || x > 14) g[y][x] = '#';
      else if (g[y][x] === '#') g[y][x] = '.';
    }
  }

  // Pilares do arco entre pasillo e sala
  g[14][4] = 'a';
  g[14][15] = 'a';

  // Zona de entrada + barra fronteiriza
  rect(g, W, H, 1, 39, W - 2, 42, '.');
  rect(g, W, H, 2, 40, 6, 40, 'B');

  // Saída sur
  g[44][9] = 'D';
  g[44][10] = 'D';
  g[44][11] = 'D';
  g[45][10] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'B', 'L', 'a'],
    entry: { tx: 10, ty: 42 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'B') {
        gfx.fillStyle(0x8b6914, 0.4);
        gfx.fillRect(x + 1, y + 4, tileSize - 2, tileSize - 5);
      }
      if (ch === 'S') {
        gfx.fillStyle(0x9b59b6, 0.25);
        gfx.fillRect(x, y, tileSize, tileSize);
        gfx.fillStyle(0xf4d35e, 0.35);
        gfx.fillRect(x + 4, y + 2, tileSize - 8, 3);
      }
      if (ch === 'L') {
        gfx.fillStyle(0xe8b4ff, 0.7);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, 3);
      }
      if (ch === 'a') {
        gfx.fillStyle(0x5c4a6a, 1);
        gfx.fillRect(x + 4, y + 2, tileSize - 8, tileSize - 4);
      }
    },
  });
}
