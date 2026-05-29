import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 34;
const H = 26;

export const SAN_MARTIN_PINARIO_PATRONS = [
  { tx: 10, ty: 18 },
  { tx: 23, ty: 18 },
];

export function buildSanMartinPinarioLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 10, 2, 23, 9, 'A');
  for (let y = 11; y <= H - 5; y++) {
    g[y][6] = 'P';
    g[y][W - 7] = 'P';
  }
  for (let x = 8; x <= W - 9; x += 5) g[12][x] = 'P';
  g[5][16] = 'O';
  const entry = carveSouthExit(g, W, H);
  return finishLayout(
    g,
    { '#': 0x2a2218, '.': 0xd7ccc8, A: 0x6b4423, P: 0x5c4030, O: 0xc9a227, D: 0x8b6914 },
    ['#', 'A', 'P', 'O'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'O') {
        gfx.fillStyle(0xffd54f, 0.7);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 5);
      }
      if (ch === 'A') {
        gfx.fillStyle(0xf4d35e, 0.35);
        gfx.fillRect(x + 2, y + 4, ts - 4, 6);
      }
    }
  );
}
