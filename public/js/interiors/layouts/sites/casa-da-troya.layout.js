import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 24;
const H = 14;

export const CASA_DA_TROYA_PATRONS = [
  { tx: 5, ty: 5 },
  { tx: 17, ty: 6 },
];

export function buildCasaDaTroyaLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  g[3][4] = 'w';
  g[3][8] = 'w';
  g[4][12] = 'w';
  g[5][6] = 't';
  g[5][15] = 't';
  rect(g, W, H, 2, 2, 6, 3, 'M');
  rect(g, W, H, 16, 7, 21, 9, 'L');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x3e2723, '.': 0xffecb3, w: 0x8d6e63, t: 0x6d4c41, M: 0x5d4037, L: 0x78909c, D: 0x6b5030 },
    ['#', 'w', 't', 'M', 'L'],
    entry
  );
}
