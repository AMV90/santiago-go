import { MAP_BOUNDS, OLD_TOWN_BOUNDS, FONTINAS_BOUNDS } from './map-bounds.js';

export const BOUNDS = MAP_BOUNDS;
export { OLD_TOWN_BOUNDS, FONTINAS_BOUNDS };

export function project(lon, lat, width, height, bounds = BOUNDS) {
  return {
    x: ((lon - bounds.west) / (bounds.east - bounds.west)) * width,
    y: ((bounds.north - lat) / (bounds.north - bounds.south)) * height,
  };
}

export function unproject(x, y, width, height, bounds = BOUNDS) {
  const lon = bounds.west + (x / width) * (bounds.east - bounds.west);
  const lat = bounds.north - (y / height) * (bounds.north - bounds.south);
  return { lon, lat };
}

/** Metros por píxel no mapa do xogo (para minimapa, etc.) */
export function metersPerPixel(mapData) {
  const b = mapData.bounds;
  const latMid = (b.north + b.south) / 2;
  const latRad = (latMid * Math.PI) / 180;
  const mPerDegLat = 110540;
  const mPerDegLon = 111320 * Math.cos(latRad);
  const widthM = (b.east - b.west) * mPerDegLon;
  const heightM = (b.north - b.south) * mPerDegLat;
  const mppX = widthM / mapData.width;
  const mppY = heightM / mapData.height;
  return { x: mppX, y: mppY, avg: (mppX + mppY) / 2 };
}

export const CATEGORY_COLORS = {
  comercio: '#54a0ff',
  hostelería: '#ff9f43',
  turismo: '#5f27cd',
  alojamiento: '#10ac84',
  farmacia: '#ee5253',
  banco: '#c8d6e5',
  información: '#48dbfb',
  local: '#ff6b6b',
};
