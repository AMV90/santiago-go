import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 26;
const H = 24;

export const CONVENTO_SAN_FRANCISCO_PATRONS = [
  { tx: 6, ty: 16 },
  { tx: 19, ty: 16 },
];

export function buildConventoSanFranciscoLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 8, 2, 17, 7, 'A');
  for (let y = 9; y <= H - 4; y++) {
    for (let x = 5; x <= 20; x += 6) g[y][x] = 'P';
  }
  g[4][12] = 'X';
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x2a2218, '.': 0xc9b896, A: 0x5c4030, P: 0x6b4423, X: 0x8d6e63, D: 0x8b6914 },
    ['#', 'A', 'P', 'X'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'A') {
        gfx.fillStyle(0xf4d35e, 0.5);
        gfx.fillRect(x + 2, y + 3, ts - 4, 5);
      }
      if (ch === 'X') {
        gfx.fillStyle(0x5d4037, 1);
        gfx.fillRect(x + 5, y + 4, 6, 8);
      }
    }
  );
}
