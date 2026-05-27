import { buildStreetWalker } from './street-walk.js';
import { drawStreetLayer } from './street-render.js';
import { fetchStreetChunk } from './game-api.js';
import { getCameraWorldView } from './viewport-utils.js';

const CHUNK_REFETCH_DIST = 700;
const MIN_STREET_RADIUS = 2200;
const MAX_STREET_RADIUS = 5200;

export function initStreetChunks(scene, streets) {
  scene.streetById = new Map();
  scene._chunkCenter = null;
  scene._chunkRadius = 0;
  scene._chunkLoading = false;
  mergeStreetChunk(scene, streets || []);
}

export function getLoadedStreets(scene) {
  return [...(scene.streetById?.values() || [])];
}

export function mergeStreetChunk(scene, streets) {
  if (!scene.streetById) scene.streetById = new Map();
  let added = 0;
  for (const s of streets) {
    if (!s?.id || scene.streetById.has(s.id)) continue;
    scene.streetById.set(s.id, s);
    added++;
  }
  if (added > 0 || !scene.streetWalker) {
    scene.streetWalker = buildStreetWalker(getLoadedStreets(scene));
    redrawStreetLayer(scene);
  }
}

export function redrawStreetLayer(scene) {
  if (!scene.streetGfx) return;
  drawStreetLayer(scene.streetGfx, getLoadedStreets(scene));
}

export async function ensureStreetChunks(scene) {
  if (!scene.player || scene._chunkLoading) return;

  const { cx, cy, radius } = getCameraWorldView(scene);
  const fetchRadius = Math.min(
    MAX_STREET_RADIUS,
    Math.max(MIN_STREET_RADIUS, Math.ceil(radius))
  );

  const center = scene._chunkCenter;
  const needFetch =
    !center ||
    Math.hypot(cx - center.x, cy - center.y) > CHUNK_REFETCH_DIST ||
    fetchRadius > (scene._chunkRadius || 0) * 1.15;

  if (!needFetch) return;

  scene._chunkLoading = true;
  try {
    const data = await fetchStreetChunk(cx, cy, fetchRadius);
    mergeStreetChunk(scene, data.streets || []);
    scene._chunkCenter = { x: cx, y: cy };
    scene._chunkRadius = fetchRadius;
  } catch (err) {
    console.warn('Chunk de rúas:', err.message);
  } finally {
    scene._chunkLoading = false;
  }
}
