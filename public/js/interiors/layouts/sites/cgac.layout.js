import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 32;
const H = 20;

export const CGAC_PATRONS = [
  { tx: 9, ty: 12 },
  { tx: 22, ty: 12 },
];

export function buildCgacLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 6, 4, 12, 10, 'P');
  rect(g, W, H, 19, 5, 25, 11, 'Q');
  g[6][15] = 'q';
  rect(g, W, H, 2, 2, W - 3, 2, 'W');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0xb0bec5, '.': 0xfafafa, P: 0xe0e0e0, Q: 0x9e9e9e, q: 0x212121, W: 0xffffff, D: 0x6b5030 },
    ['#', 'P', 'Q', 'q', 'W'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'q') {
        gfx.fillStyle(0x424242, 1);
        gfx.fillRect(x + 3, y + 2, ts - 6, ts - 4);
      }
    }
  );
}
