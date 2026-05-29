import { createLayout } from '../../layout-utils.js';

export function carveSouthExit(g, W, H, aisle = 5) {
  const mid = Math.floor(W / 2);
  const half = Math.floor(aisle / 2);
  for (let y = H - 5; y <= H - 3; y++) {
    for (let x = mid - half; x <= mid + half; x++) {
      if (g[y]?.[x] !== undefined) g[y][x] = '.';
    }
  }
  g[H - 2][mid - 1] = 'D';
  g[H - 2][mid] = 'D';
  g[H - 2][mid + 1] = 'D';
  g[H - 1][mid] = 'D';
  return { tx: mid, ty: H - 4 };
}

export function finishLayout(g, colors, blocked, entry, drawTileExtra = null) {
  const H = g.length;
  const W = g[0].length;
  const rows = g.map((row) => row.join(''));
  return createLayout({
    tileSize: 16,
    rows,
    colors,
    blocked,
    entry,
    exitChar: 'D',
    drawTileExtra,
  });
}
