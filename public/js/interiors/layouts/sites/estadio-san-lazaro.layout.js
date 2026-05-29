import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

const W = 46;
const H = 30;

export const ESTADIO_SAN_LAZARO_PATRONS = [
  { tx: 8, ty: 22 },
  { tx: 37, ty: 22 },
];

export function buildEstadioSanLazaroLayout() {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 1, 1, W - 2, 2, 'R');
  rect(g, W, H, 1, H - 3, W - 2, H - 2, 'R');
  rect(g, W, H, 1, 3, 3, H - 4, 'R');
  rect(g, W, H, W - 4, 3, W - 2, H - 4, 'R');
  rect(g, W, H, 8, 8, W - 9, H - 9, 'F');
  g[12][10] = 'G';
  g[12][W - 11] = 'G';
  g[16][Math.floor(W / 2)] = 'B';
  const entry = carveSouthExit(g, W, H, 9);
  return finishLayout(
    g,
    { '#': 0x37474f, R: 0x607d8b, F: 0x43a047, G: 0xffffff, B: 0xffeb3b, D: 0x6b5030 },
    ['#', 'R', 'G', 'B'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'G') {
        gfx.fillStyle(0xffffff, 0.9);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 3);
      }
      if (ch === 'F' && (x + y) % 32 === 0) {
        gfx.fillStyle(0xffffff, 0.15);
        gfx.fillRect(x, y, ts, ts);
      }
    }
  );
}
