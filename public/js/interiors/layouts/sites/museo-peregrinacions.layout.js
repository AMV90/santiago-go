import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 30;
const H = 18;

export const MUSEO_PEREGRINACIONS_PATRONS = [
  { tx: 8, ty: 10 },
  { tx: 21, ty: 10 },
];

export function buildMuseoPeregrinacionsLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 4, 3, 10, 6, 'b');
  g[4][7] = 's';
  rect(g, W, H, 18, 3, 25, 6, 'C');
  g[5][21] = 'c';
  for (let x = 12; x <= 17; x++) g[8][x] = 'o';
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x4e342e, '.': 0xefebe9, b: 0x5d4037, s: 0xf4d35e, C: 0x8d6e63, c: 0xffcc80, o: 0xd7ccc8, D: 0x6b5030 },
    ['#', 'b', 's', 'C', 'c', 'o'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 's') {
        gfx.fillStyle(0xffeb3b, 1);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
      if (ch === 'o') {
        gfx.fillStyle(0xc9a227, 0.5);
        gfx.fillRect(x + 4, y + 6, ts - 8, 2);
      }
    }
  );
}
