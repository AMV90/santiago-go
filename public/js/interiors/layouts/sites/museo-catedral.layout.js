import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 28;
const H = 20;

export const MUSEO_CATEDRAL_PATRONS = [
  { tx: 7, ty: 12 },
  { tx: 20, ty: 12 },
];

export function buildMuseoCatedralLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 10, 2, 17, 6, 'T');
  g[4][13] = 'O';
  rect(g, W, H, 4, 9, 9, 13, 'V');
  rect(g, W, H, 18, 9, 23, 13, 'V');
  g[8][13] = 't';
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x4e342e, '.': 0xefebe9, T: 0x8d6e63, O: 0xc9a227, V: 0x5d4037, t: 0xff8f00, D: 0x6b5030 },
    ['#', 'T', 'O', 'V', 't'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'O') {
        gfx.fillStyle(0xff8f00, 0.6);
        gfx.fillEllipse(x + ts / 2, y + 4, 4, 6);
      }
      if (ch === 't') {
        gfx.fillStyle(0xc9a227, 0.5);
        gfx.fillRect(x + 5, y + 2, 6, ts - 4);
      }
    }
  );
}
