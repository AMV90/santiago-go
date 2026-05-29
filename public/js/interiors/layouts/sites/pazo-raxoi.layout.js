import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 30;
const H = 16;

export const PAZO_RAXOI_PATRONS = [
  { tx: 8, ty: 8 },
  { tx: 21, ty: 8 },
];

export function buildPazoRaxoiLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 2, 2, W - 3, 4, 'R');
  rect(g, W, H, 4, 5, W - 5, 6, 'W');
  g[3][15] = 'O';
  rect(g, W, H, 6, 8, 23, 8, 'd');
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x455a64, '.': 0xeceff1, R: 0x78909c, W: 0xb0bec5, O: 0xc9a227, d: 0x546e7a, D: 0x6b5030 },
    ['#', 'R', 'W', 'O', 'd'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'O') {
        gfx.fillStyle(0xffd54f, 1);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 4);
      }
      if (ch === 'W') {
        gfx.fillStyle(0x4fc3f7, 0.35);
        gfx.fillRect(x + 2, y + 2, ts - 4, ts - 5);
      }
    }
  );
}
