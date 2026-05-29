import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 38;
const H = 16;

export const PALACIO_CONGRESOS_PATRONS = [
  { tx: 7, ty: 7 },
  { tx: 28, ty: 7 },
];

export function buildPalacioCongresosLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let x = 3; x < W - 3; x += 8) {
    rect(g, W, H, x, 3, x + 5, 5, 'E');
    g[6][x + 2] = 'e';
  }
  rect(g, W, H, 14, 2, 23, 2, 'S');
  const entry = carveSouthExit(g, W, H, 9);
  return finishLayout(
    g,
    { '#': 0x455a64, '.': 0xeceff1, E: 0x90a4ae, e: 0x4fc3f7, S: 0x546e7a, D: 0x6b5030 },
    ['#', 'E', 'e', 'S'],
    entry
  );
}
