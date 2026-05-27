import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 54;
const H = 12;

const COLORS = {
  '#': 0x1a1420,
  '.': 0x3d2f28,
  B: 0x6b4423,
  s: 0x4a3828,
  T: 0x5c4033,
  t: 0x352820,
  D: 0x8b6914,
  J: 0x2ecc71,
  L: 0xff6b9d,
};

export function buildBarMomoLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 2, 2, W - 3, 2, 'B');
  rect(g, W, H, 2, 1, W - 3, 1, 'B');

  for (let x = 4; x <= W - 5; x += 3) {
    if (g[3][x] === '.') g[3][x] = 's';
  }

  for (let x = 10; x <= W - 8; x += 9) {
    g[6][x] = 'T';
    g[6][x + 1] = 'T';
    g[7][x] = 't';
    g[7][x + 1] = 't';
  }

  rect(g, W, H, W - 8, 4, W - 3, 8, '.');
  g[5][W - 4] = 'J';
  g[1][12] = 'L';
  g[1][26] = 'L';
  g[1][40] = 'L';

  g[5][1] = 'D';
  g[6][1] = 'D';
  g[7][1] = 'D';
  g[6][0] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'B', 'T', 'J', 'L'],
    entry: { tx: 3, ty: 6 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'B') {
        gfx.fillStyle(0x8b6914, 0.35);
        gfx.fillRect(x + 1, y + 4, tileSize - 2, tileSize - 5);
      }
      if (ch === 'L') {
        gfx.fillStyle(0xff6b9d, 0.55);
        gfx.fillRect(x + 4, y + 2, tileSize - 8, 4);
      }
      if (ch === 'J') {
        gfx.fillStyle(0x27ae60, 0.5);
        gfx.fillRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
      }
      if (ch === 's') {
        gfx.fillStyle(0x7a6548, 0.6);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, 3);
      }
    },
  });
}

export const BAR_MOMO_CHATTER = [
  { id: 'momo-1', line: 'Una caña do Momo e seguimos…', tx: 4, ty: 3, tint: 0xffcc80 },
  { id: 'momo-2', line: 'Aquí o xacobeo sabe a cervexa.', tx: 10, ty: 3, tint: 0xffcc80 },
  { id: 'momo-3', line: 'Best pub in the old town, no cap.', tx: 16, ty: 3, tint: 0xffcc80 },
  {
    id: 'momo-4',
    line: 'Que te ponho? Temos o cóctel peregrino.',
    tx: 22,
    ty: 2,
    tint: 0xffffff,
    emoji: '🍸',
  },
  { id: 'momo-5', line: 'Outra ronda! Que mañá xa veremos.', tx: 28, ty: 3, tint: 0xffcc80 },
  { id: 'momo-6', line: 'Esta barra non acaba nunca…', tx: 34, ty: 3, tint: 0xffcc80 },
  { id: 'momo-7', line: 'Aquí compoñéronse medio Camiño.', tx: 40, ty: 3, tint: 0xffcc80 },
  { id: 'momo-8', line: 'Un último chupito e vaímonos.', tx: 46, ty: 3, tint: 0xffcc80 },
];
