import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 30;
const H = 22;

export const COLEXIO_SAN_CLEMENTE_PATRONS = [
  { tx: 8, ty: 14 },
  { tx: 21, ty: 14 },
];

export function buildColexioSanClementeLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let y = 2; y <= H - 3; y++) {
    g[y][3] = 'a';
    g[y][W - 4] = 'a';
  }
  rect(g, W, H, 3, 2, W - 4, 2, 'a');
  rect(g, W, H, 10, 8, 19, 12, 'P');
  g[6][14] = 'S';
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x5d4037, '.': 0xd7ccc8, a: 0x8d6e63, P: 0x6b4423, S: 0xc9a227, D: 0x6b5030 },
    ['#', 'a', 'P', 'S'],
    entry
  );
}
