import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 28;
const H = 22;

export const MUSEO_POBO_GALEGO_PATRONS = [
  { tx: 8, ty: 14 },
  { tx: 19, ty: 10 },
];

export function buildMuseoPoboGalegoLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let y = 2; y <= H - 3; y++) {
    g[y][2] = 'a';
    g[y][W - 3] = 'a';
  }
  rect(g, W, H, 10, 3, 17, 8, 'N');
  g[6][13] = 'n';
  rect(g, W, H, 4, 10, 9, 16, 'E');
  rect(g, W, H, 18, 10, 23, 16, 'E');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x4e342e, '.': 0xd7ccc8, a: 0x6d4c41, N: 0x5d4037, n: 0x8d6e63, E: 0x795548, D: 0x6b5030 },
    ['#', 'a', 'N', 'n', 'E'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'n') {
        gfx.fillStyle(0x90a4ae, 0.7);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 5);
        gfx.lineStyle(1, 0x546e7a, 0.8);
        gfx.strokeCircle(x + ts / 2, y + ts / 2, 5);
      }
      if (ch === 'N') {
        gfx.fillStyle(0x6d4c41, 0.5);
        gfx.fillRect(x + 2, y + 4, ts - 4, ts - 6);
      }
    }
  );
}
