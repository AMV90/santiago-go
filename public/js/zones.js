import { MAP_BOUNDS, OLD_TOWN_BOUNDS, FONTINAS_BOUNDS } from './map-bounds.js';
import { unproject } from './geo.js';

export function lonLatFromGame(x, y, mapData) {
  return unproject(x, y, mapData.width, mapData.height, mapData.bounds);
}

export function isInBounds(lon, lat, b) {
  return lat <= b.north && lat >= b.south && lon >= b.west && lon <= b.east;
}

export function isOldTown(lon, lat) {
  return isInBounds(lon, lat, OLD_TOWN_BOUNDS);
}

export function isFontinas(lon, lat) {
  return isInBounds(lon, lat, FONTINAS_BOUNDS);
}

/** Zona verde / arredores — lonxe do casco (Milladoiro sur, periferia), non no centro */
export function isOuterFieldZone(lon, lat) {
  if (isOldTown(lon, lat)) return false;
  if (isFontinas(lon, lat)) return false;
  if (isMilladoiroArea(lon, lat)) return true;
  if (lat < OLD_TOWN_BOUNDS.south - 0.002) return true;
  if (lon < OLD_TOWN_BOUNDS.west - 0.003) return true;
  if (lat > OLD_TOWN_BOUNDS.north + 0.004) return true;
  if (lon > OLD_TOWN_BOUNDS.east + 0.004) return true;
  return false;
}

export function isMilladoiroArea(lon, lat) {
  return lat < 42.855 && lon < -8.565;
}
