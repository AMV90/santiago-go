import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 40;
const H = 16;

export const MERCADO_ABASTOS_PATRONS = [
  { tx: 7, ty: 6 },
  { tx: 30, ty: 6 },
];

export function buildMercadoAbastosLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 2, 2, 17, H - 3, 'f');
  rect(g, W, H, 21, 2, W - 3, H - 3, 'v');
  for (let x = 3; x <= 16; x += 4) {
    g[4][x] = 'P';
    g[5][x] = 'p';
  }
  for (let x = 22; x <= W - 4; x += 4) {
    g[4][x] = 'V';
    g[5][x] = 'v';
  }
  g[2][10] = 'H';
  const entry = carveSouthExit(g, W, H, 7);
  return finishLayout(
    g,
    { '#': 0x5d4037, '.': 0xf5e6d3, f: 0x4fc3f7, p: 0xffccbc, P: 0x0288d1, v: 0x8bc34a, V: 0x689f38, H: 0xc62828, D: 0x6b5030 },
    ['#', 'P', 'p', 'V', 'v', 'H'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'P') {
        gfx.fillStyle(0x01579b, 0.4);
        gfx.fillRect(x, y + ts - 4, ts, 4);
      }
      if (ch === 'H') {
        gfx.fillStyle(0xffeb3b, 1);
        gfx.fillRect(x + 2, y + 2, ts - 4, 4);
      }
    }
  );
}
