import { project } from '../geo.js';
import { MAP_BOUNDS, MAP_HEIGHT, MAP_WIDTH } from '../map-bounds.js';

/** Resolves overworld return position from place.world config */
export function resolveWorldPosition(world, scene) {
  if (!world) return { x: scene.player.x, y: scene.player.y };

  switch (world.kind) {
    case 'spawn':
      return { x: scene.spawnPoint.x, y: scene.spawnPoint.y };
    case 'lonlat': {
      const p = project(world.lon, world.lat, MAP_WIDTH, MAP_HEIGHT, MAP_BOUNDS);
      return { x: Math.round(p.x), y: Math.round(p.y) };
    }
    case 'xy':
      return { x: world.x, y: world.y };
    default:
      return { x: scene.player.x, y: scene.player.y };
  }
}

export function resolveDoorPosition(world, scene) {
  return resolveWorldPosition(world, scene);
}
