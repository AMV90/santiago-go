import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 42;
const H = 14;

export const AS_CANCELAS_PATRONS = [
  { tx: 9, ty: 5 },
  { tx: 30, ty: 5 },
];

export function buildAsCancelasLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let x = 3; x < W - 4; x += 9) {
    g[3][x] = 'L';
    g[4][x] = 'l';
    g[3][x + 1] = 'l';
  }
  rect(g, W, H, 18, 2, 23, 3, 'F');
  g[7][20] = 'C';
  const entry = carveSouthExit(g, W, H, 9);
  return finishLayout(
    g,
    { '#': 0x546e7a, '.': 0xf5f5f5, L: 0x78909c, l: 0x4fc3f7, F: 0xff7043, C: 0xffeb3b, D: 0x6b5030 },
    ['#', 'L', 'l', 'F', 'C'],
    entry
  );
}
