import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 32;
const H = 20;

export const HOSTAL_REIS_CATOLICOS_PATRONS = [
  { tx: 9, ty: 12 },
  { tx: 22, ty: 12 },
];

export function buildHostalReisCatolicosLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let x = 2; x < W - 2; x++) {
    if (x % 5 === 0) g[4][x] = 'c';
  }
  rect(g, W, H, 12, 8, 19, 12, 'Q');
  g[10][15] = 'F';
  rect(g, W, H, 2, 2, 5, H - 3, 'L');
  rect(g, W, H, W - 6, 2, W - 3, H - 3, 'L');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x3e2723, '.': 0xf5f0e6, c: 0x8d6e63, Q: 0xc9a227, F: 0x4fc3f7, L: 0x5d4037, D: 0x6b5030 },
    ['#', 'c', 'Q', 'F', 'L'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'Q') {
        gfx.fillStyle(0xffd54f, 0.5);
        gfx.fillRect(x + 2, y + 2, ts - 4, 4);
      }
      if (ch === 'F') {
        gfx.fillStyle(0x29b6f6, 0.45);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
    }
  );
}
