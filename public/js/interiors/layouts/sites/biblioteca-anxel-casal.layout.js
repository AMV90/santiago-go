import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 36;
const H = 14;

export const BIBLIOTECA_ANXEL_CASAL_PATRONS = [
  { tx: 10, ty: 6 },
  { tx: 25, ty: 6 },
];

export function buildBibliotecaAnxelCasalLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  for (let x = 2; x < W - 2; x += 3) {
    g[2][x] = 'B';
    g[3][x] = 'B';
    g[4][x] = 'b';
  }
  rect(g, W, H, 14, 5, 21, 5, 'T');
  rect(g, W, H, 4, 8, 10, 9, 'R');
  rect(g, W, H, W - 11, 8, W - 5, 9, 'R');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x37474f, '.': 0xeceff1, B: 0x5d4037, b: 0x6d4c41, T: 0x455a64, R: 0x78909c, D: 0x6b5030 },
    ['#', 'B', 'b', 'T', 'R'],
    entry
  );
}
