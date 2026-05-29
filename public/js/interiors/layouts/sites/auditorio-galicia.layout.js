import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 38;
const H = 20;

export const AUDITORIO_GALICIA_PATRONS = [
  { tx: 10, ty: 14 },
  { tx: 27, ty: 14 },
];

export function buildAuditorioGaliciaLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, 2, 'S');
  rect(g, W, H, 1, 3, W - 2, H - 2, 'R');
  for (let x = 3; x < W - 3; x += 2) {
    g[H - 4][x] = 'r';
    g[H - 5][x] = 'r';
  }
  rect(g, W, H, 14, 4, 23, 8, 'L');
  const entry = carveSouthExit(g, W, H, 9);
  return finishLayout(
    g,
    { '#': 0x1a1a2e, '.': 0x2d2d44, S: 0x4a148c, R: 0x6a1b9a, r: 0xc62828, L: 0xf4d35e, D: 0x6b5030 },
    ['#', 'S', 'r', 'L'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'L') {
        gfx.fillStyle(0xffeb3b, 0.4);
        gfx.fillRect(x, y, ts, ts);
      }
    }
  );
}
