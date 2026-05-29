/**
 * Render Peleteiro en capas: base (PNG) + props (sprites y-sort).
 */
import {
  PELETEIRO_TILESET_KEY,
  ensurePeleteiroTextureFilter,
  queuePeleteiroTileset,
  buildPeleteiroFloorLayer,
} from './peleteiro-tile-render.js';
import { PLACE_TO_FORGE_ZONE, forgeAssetPath } from './peleteiro-zone-spec.js';

const PELETEIRO_TILE_SIZE = 16;
const manifestCache = new Map();

function zoneKeyForPlace(placeId) {
  return PLACE_TO_FORGE_ZONE[placeId] || null;
}

/** Precarga manifiestos (chamar no arranque do xogo). */
export function preloadPeleteiroForgeManifests() {
  for (const zk of new Set(Object.values(PLACE_TO_FORGE_ZONE))) {
    if (manifestCache.has(zk)) continue;
    fetch(forgeAssetPath(zk, 'manifest.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) manifestCache.set(zk, data);
      })
      .catch(() => {});
  }
}

export function queuePeleteiroForgeAssets(scene, placeId) {
  queuePeleteiroTileset(scene);
  const zk = zoneKeyForPlace(placeId);
  if (!zk) return;
  const baseKey = `peleteiro-base-${zk}`;
  if (!scene.textures.exists(baseKey)) {
    scene.load.image(baseKey, forgeAssetPath(zk, 'base.png'));
  }
}

/** Precarga todas as zonas Peleteiro (preload global). */
export function queueAllPeleteiroForgeAssets(scene) {
  queuePeleteiroTileset(scene);
  for (const zk of new Set(Object.values(PLACE_TO_FORGE_ZONE))) {
    const baseKey = `peleteiro-base-${zk}`;
    if (!scene.textures.exists(baseKey)) {
      scene.load.image(baseKey, forgeAssetPath(zk, 'base.png'));
    }
  }
}

/**
 * @param {string} placeId
 * @returns {{ floor, walls, propSprites, label, stairTexts, zoneTexts }}
 */
export function buildPeleteiroForgeInterior(scene, cfg, placeId) {
  ensurePeleteiroTextureFilter(scene);
  const zk = zoneKeyForPlace(placeId);
  const baseKey = zk ? `peleteiro-base-${zk}` : null;
  const propSprites = [];
  const walls = scene.add.graphics();
  walls.setDepth(4);

  let floor;
  if (baseKey && scene.textures.exists(baseKey)) {
    scene.textures.get(baseKey)?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    floor = scene.add.image(0, 0, baseKey);
    floor.setOrigin(0, 0);
    floor.setDepth(3);
  } else {
    floor = buildPeleteiroFloorLayer(scene, cfg);
  }

  const manifest = zk ? manifestCache.get(zk) : null;
  if (manifest?.placements?.length && scene.textures.exists(PELETEIRO_TILESET_KEY)) {
    for (const p of manifest.placements) {
      const x = p.tx * PELETEIRO_TILE_SIZE + PELETEIRO_TILE_SIZE / 2;
      const y = p.ty * PELETEIRO_TILE_SIZE + PELETEIRO_TILE_SIZE;
      const spr = scene.add.sprite(x, y, PELETEIRO_TILESET_KEY, p.frame);
      spr.setOrigin(0.5, 1);
      spr.setDepth(5 + y * 0.001);
      propSprites.push(spr);
    }
  }

  const zoneTexts = cfg.spawnZoneBanners?.(scene, cfg.tileSize) ?? [];
  const stairTexts = [];
  cfg.stairLabels?.forEach((lab) => {
    const t = scene.add.text(lab.x, lab.y, lab.text, {
      fontFamily: '"Press Start 2P", Consolas, monospace',
      fontSize: '8px',
      color: '#fff8e1',
      backgroundColor: 'rgba(38, 50, 56, 0.92)',
      padding: { x: 5, y: 2 },
    });
    t.setOrigin(0.5, 0.5);
    t.setDepth(6);
    stairTexts.push(t);
  });

  const title = scene.add.text(cfg.width / 2, 8, cfg.label, {
    fontFamily: '"Press Start 2P", Consolas, monospace',
    fontSize: '9px',
    color: '#f5e6c8',
    backgroundColor: 'rgba(60, 40, 20, 0.85)',
    padding: { x: 6, y: 3 },
  });
  title.setOrigin(0.5, 0);
  title.setDepth(30);

  return { floor, walls, propSprites, label: title, stairTexts, zoneTexts };
}
