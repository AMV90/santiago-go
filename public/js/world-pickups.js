import { THROW_ITEMS, FIELD_ITEM_IDS } from './items.js';
import { lonLatFromGame, isOuterFieldZone } from './zones.js';

const PICKUP_COLORS = {
  pedra: 0x7f8c8d,
  palo: 0x8b6914,
  vaso_roto: 0x48dbfb,
  hueso: 0xecf0f1,
  lata: 0xbdc3c7,
};

const FIELD_POOL = FIELD_ITEM_IDS;

/**
 * Obxectos só na zona verde / arredores (Milladoiro, periferia), lonxe do casco.
 */
export function spawnWorldPickups(mapData, count = 90) {
  const streets = mapData.streets.filter((s) => s.points.length >= 3);
  const pickups = [];
  const used = new Set();

  let attempts = 0;
  while (pickups.length < count && attempts < count * 80) {
    attempts++;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const idx = Math.floor(Math.random() * street.points.length);
    const p = street.points[idx];
    const { lon, lat } = lonLatFromGame(p.x, p.y, mapData);

    if (!isOuterFieldZone(lon, lat)) continue;

    const cell = `${Math.floor(p.x / 70)},${Math.floor(p.y / 70)}`;
    if (used.has(cell)) continue;
    used.add(cell);

    const itemId = FIELD_POOL[Math.floor(Math.random() * FIELD_POOL.length)];
    pickups.push({
      id: `pickup-${pickups.length}`,
      itemId,
      x: p.x,
      y: p.y,
      color: PICKUP_COLORS[itemId],
      zone: 'field',
    });
  }

  let urbanAttempts = 0;
  while (pickups.length < count + 12 && urbanAttempts < 200) {
    urbanAttempts++;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const p = street.points[Math.floor(Math.random() * street.points.length)];
    const { lon, lat } = lonLatFromGame(p.x, p.y, mapData);
    if (!isOuterFieldZone(lon, lat)) continue;
    const cell = `${Math.floor(p.x / 70)},${Math.floor(p.y / 70)}`;
    if (used.has(cell)) continue;
    used.add(cell);
    pickups.push({
      id: `pickup-${pickups.length}`,
      itemId: 'vaso_roto',
      x: p.x,
      y: p.y,
      color: PICKUP_COLORS.vaso_roto,
      zone: 'field',
    });
  }

  return pickups;
}

export function createPickupSprites(scene, pickups, collectedIds) {
  const sprites = [];
  for (const pickup of pickups) {
    if (collectedIds.includes(pickup.id)) continue;
    const spr = scene.add.circle(pickup.x, pickup.y, 5, pickup.color, 0.95);
    spr.setStrokeStyle(1, 0xffffff, 0.9);
    spr.setDepth(7);
    spr.setData('pickup', pickup);
    sprites.push(spr);
  }
  return sprites;
}
