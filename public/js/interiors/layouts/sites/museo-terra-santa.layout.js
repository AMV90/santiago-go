import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 26;
const H = 18;

export const MUSEO_TERRA_SANTA_PATRONS = [
  { tx: 7, ty: 10 },
  { tx: 18, ty: 10 },
];

export function buildMuseoTerraSantaLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 9, 2, 16, 7, 'H');
  for (let x = 5; x <= 20; x += 4) g[9][x] = 'L';
  g[5][12] = 'C';
  rect(g, W, H, 4, 11, 8, 14, 'R');
  rect(g, W, H, 17, 11, 21, 14, 'R');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x3e2723, '.': 0x5d4037, H: 0x4e342e, L: 0xffeb3b, C: 0xff6f00, R: 0x6d4c41, D: 0x6b5030 },
    ['#', 'H', 'L', 'C', 'R'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'L') {
        gfx.fillStyle(0xffeb3b, 0.85);
        gfx.fillRect(x + ts / 2 - 1, y + 3, 2, ts - 6);
        gfx.fillCircle(x + ts / 2, y + 3, 3);
      }
      if (ch === 'C') {
        gfx.fillStyle(0xff6f00, 0.5);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
    }
  );
}
