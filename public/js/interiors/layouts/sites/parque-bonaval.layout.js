import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 40;
const H = 30;

export const PARQUE_BONAVAL_PATRONS = [
  { tx: 12, ty: 16 },
  { tx: 28, ty: 18 },
];

export function buildParqueBonavalLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, 'g');
  for (let y = 4; y <= H - 6; y += 5) {
    for (let x = 5; x <= W - 6; x += 6) {
      if ((x + y) % 9 === 0) g[y][x] = 'T';
    }
  }
  rect(g, W, H, 16, 8, 23, 12, '.');
  rect(g, W, H, 6, 6, 11, 9, 'M');
  g[7][8] = 'n';
  const entry = carveSouthExit(g, W, H, 7);
  return finishLayout(
    g,
    { '#': 0x33691e, g: 0x689f38, T: 0x2e7d32, M: 0x8d6e63, n: 0x90a4ae, '.': 0xc8e6a8, D: 0x6b5030 },
    ['#', 'T', 'M', 'n'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'n') {
        gfx.fillStyle(0xb0bec5, 0.8);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
    }
  );
}
