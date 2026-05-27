const TILE = 256;

export function lonLatToMercator(lon, lat, zoom) {
  const scale = TILE * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
}

export function createMapProjection(mapData, zoom = 16) {
  const nw = lonLatToMercator(mapData.bounds.west, mapData.bounds.north, zoom);
  const se = lonLatToMercator(mapData.bounds.east, mapData.bounds.south, zoom);
  const mercW = se.x - nw.x;
  const mercH = se.y - nw.y;

  const nwTileX = Math.floor(nw.x / TILE);
  const nwTileY = Math.floor(nw.y / TILE);
  const seTileX = Math.floor(se.x / TILE);
  const seTileY = Math.floor(se.y / TILE);

  function gameToMercator(gx, gy) {
    return {
      mx: nw.x + (gx / mapData.width) * mercW,
      my: nw.y + (gy / mapData.height) * mercH,
    };
  }

  function gameToTile(gx, gy) {
    const { mx, my } = gameToMercator(gx, gy);
    return { tx: Math.floor(mx / TILE), ty: Math.floor(my / TILE) };
  }

  function tileToGameRect(tx, ty) {
    const mX0 = tx * TILE;
    const mY0 = ty * TILE;
    const mX1 = (tx + 1) * TILE;
    const mY1 = (ty + 1) * TILE;
    const p0 = mercToGame(mX0, mY0);
    const p1 = mercToGame(mX1, mY1);
    return {
      x: p0.x,
      y: p0.y,
      width: p1.x - p0.x,
      height: p1.y - p0.y,
    };
  }

  function mercToGame(mx, my) {
    return {
      x: ((mx - nw.x) / mercW) * mapData.width,
      y: ((my - nw.y) / mercH) * mapData.height,
    };
  }

  return {
    zoom,
    nw,
    se,
    nwTileX,
    nwTileY,
    seTileX,
    seTileY,
    mercToGame,
    gameToTile,
    tileToGameRect,
    tileUrl: (tx, ty) => `/api/tiles/${zoom}/${tx}/${ty}`,
  };
}
