/**
 * Utilidades compartidas para plantas de interiores (tiles ASCII).
 */

export function fillGrid(width, height, fill = '#') {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

export function rect(grid, width, height, x0, y0, x1, y1, ch) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y >= 0 && y < height && x >= 0 && x < width) grid[y][x] = ch;
    }
  }
}

/**
 * Converte filas ASCII en API de layout reutilizable.
 */
export function createLayout({
  tileSize = 16,
  rows,
  colors = {},
  blocked = ['#'],
  entry = { tx: 1, ty: 1 },
  entryFromUp = null,
  entryFromDown = null,
  exitChar = 'D',
  drawTileExtra = null,
  drawOverlay = null,
  tileset = null,
  stairLabels = null,
}) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;

  const blockedSet = new Set(blocked);

  function getTileAt(tx, ty) {
    if (ty < 0 || ty >= height) return '#';
    const row = rows[ty];
    if (tx < 0 || tx >= row.length) return '#';
    return row[tx];
  }

  function isBlocked(char) {
    return blockedSet.has(char);
  }

  function tileToWorld(tx, ty) {
    return {
      x: tx * tileSize + tileSize / 2,
      y: ty * tileSize + tileSize / 2,
    };
  }

  return {
    tileSize,
    rows,
    width: width * tileSize,
    height: height * tileSize,
    colors,
    blocked,
    exitChar,
    getTileAt,
    isBlocked,
    tileToWorld,
    getEntrySpawn: () => tileToWorld(entry.tx, entry.ty),
    getSpawnForLink: (via) => {
      if (via === 'up' && entryFromUp) return tileToWorld(entryFromUp.tx, entryFromUp.ty);
      if (via === 'down' && entryFromDown) return tileToWorld(entryFromDown.tx, entryFromDown.ty);
      return tileToWorld(entry.tx, entry.ty);
    },
    isExitTile: (tx, ty) => getTileAt(tx, ty) === exitChar,
    drawTileExtra,
    drawOverlay,
    tileset,
    stairLabels,
  };
}
