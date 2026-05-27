import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 20;
const H = 50;

const COLORS = {
  '#': 0x2a2218,
  '.': 0x4a3d32,
  c: 0x2e2520,
  B: 0x5c4030,
  r: 0x3d3228,
  S: 0x352820,
  R: 0x1e1812,
  D: 0x6b5030,
};

export const MODUS_WAITRESS = { tx: 8, ty: 38 };
export const MODUS_SINGER = { tx: 10, ty: 6 };

export function buildModusVivendiLayout() {
  const g = fillGrid(W, H, '#');

  // Planta baixa — cueva / antigas caballerizas (máis pequena)
  for (let y = 2; y <= 22; y++) {
    for (let x = 4; x <= 15; x++) {
      g[y][x] = 'c';
    }
  }
  rect(g, W, H, 5, 3, 14, 3, 'S');
  rect(g, W, H, 6, 8, 11, 8, 'B');
  g[5][6] = 'R';
  g[5][13] = 'R';
  g[12][5] = 'R';
  g[12][14] = 'R';

  // Escaleira / rampa cara abaixo
  for (let y = 23; y <= 32; y++) {
    g[y][9] = 'r';
    g[y][10] = 'r';
  }
  g[23][8] = 'r';
  g[23][11] = 'r';

  // Planta alta — barra á entrada
  rect(g, W, H, 1, 33, W - 2, 43, '.');
  rect(g, W, H, 2, 37, 7, 37, 'B');
  g[36][4] = 'R';
  g[36][15] = 'R';

  // Saída sur
  g[46][9] = 'D';
  g[46][10] = 'D';
  g[46][11] = 'D';
  g[47][10] = 'D';
  rect(g, W, H, 1, 44, W - 2, 45, '.');

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'B', 'R'],
    entry: { tx: 10, ty: 42 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'B') {
        gfx.fillStyle(0x8b6914, 0.45);
        gfx.fillRect(x + 1, y + 4, tileSize - 2, tileSize - 5);
      }
      if (ch === 'r') {
        gfx.fillStyle(0x5c4a3a, 0.85);
        gfx.fillRect(x + 1, y + 2, tileSize - 2, tileSize - 3);
        gfx.fillStyle(0x3d3228, 1);
        gfx.fillRect(x + 2, y + tileSize - 4, tileSize - 4, 2);
      }
      if (ch === 'S') {
        gfx.fillStyle(0x6b5030, 0.35);
        gfx.fillRect(x, y, tileSize, tileSize);
        gfx.fillStyle(0xc9a227, 0.3);
        gfx.fillRect(x + 3, y + 2, tileSize - 6, 2);
      }
      if (ch === 'c') {
        gfx.fillStyle(0x1a1510, 0.12);
        gfx.fillCircle(x + 4, y + 6, 2);
        gfx.fillCircle(x + tileSize - 5, y + 10, 2);
      }
      if (ch === 'R') {
        gfx.fillStyle(0x1e1812, 1);
        gfx.fillRect(x + 2, y + 1, tileSize - 4, tileSize - 2);
        gfx.fillStyle(0x3d3228, 0.5);
        gfx.fillRect(x + 4, y + 3, tileSize - 8, tileSize - 6);
      }
    },
  });
}
