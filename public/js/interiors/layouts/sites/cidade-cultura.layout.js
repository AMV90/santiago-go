import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 44;
const H = 26;

export const CIDADE_CULTURA_PATRONS = [
  { tx: 12, ty: 16 },
  { tx: 31, ty: 14 },
];

export function buildCidadeCulturaLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 4, 4, 18, 14, 'A');
  rect(g, W, H, 24, 6, 40, 18, 'B');
  for (let y = 5; y <= 12; y++) g[y][22] = 'r';
  g[8][10] = 'G';
  g[8][34] = 'G';
  const entry = carveSouthExit(g, W, H, 7);
  return finishLayout(
    g,
    { '#': 0x607d8b, '.': 0xeceff1, A: 0xb0bec5, B: 0x90a4ae, r: 0x78909c, G: 0x4caf50, D: 0x6b5030 },
    ['#', 'A', 'B', 'r', 'G'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'G') {
        gfx.fillStyle(0x66bb6a, 0.6);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 5);
      }
    }
  );
}
