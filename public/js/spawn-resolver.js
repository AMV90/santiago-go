import { CATHEDRAL } from './map-bounds.js';
import { project } from './geo.js';

const SPAWN_STREET_NAMES = [
  'Praza do Obradoiro',
  'Praciña da Quintana',
  'Rúa do Franco',
  'Rúa da Senra',
];

/**
 * Punto fixo na praza da Catedral (sobre unha rúa real do OSM).
 */
export function resolveSpawnPoint(mapData, streetWalker) {
  for (const name of SPAWN_STREET_NAMES) {
    const matches = mapData.streets.filter((s) => s.name === name && s.points.length >= 2);
    for (const street of matches) {
      const mid = street.points[Math.floor(street.points.length / 2)];
      if (streetWalker.isWalkable(mid.x, mid.y)) {
        return { x: mid.x, y: mid.y, label: `${name} — Catedral` };
      }
      const snapped = streetWalker.snapToStreet(mid.x, mid.y);
      if (streetWalker.isWalkable(snapped.x, snapped.y)) {
        return { x: snapped.x, y: snapped.y, label: `${name} — Catedral` };
      }
    }
  }

  const cat = mapData.meta?.spawn || project(
    CATHEDRAL.lon,
    CATHEDRAL.lat,
    mapData.width,
    mapData.height,
    mapData.bounds
  );
  const snapped = streetWalker.snapToStreet(cat.x, cat.y);
  return {
    x: Math.round(snapped.x),
    y: Math.round(snapped.y),
    label: CATHEDRAL.label,
  };
}
