/**
 * Personaxes unificados LPC (Universal Liberated Pixel Cup).
 */
import { LPC_FRAME_W, LPC_FRAME_H, LPC_WALK_DIRS, lpcWalkDirection } from './lpc-layout.js';

import { LPC_MANIFEST } from './lpc-manifest-data.js';

const BOT_TINTS = [0xffffff, 0xfff8f0, 0xf0f8ff, 0xfff0f5, 0xf5fff5, 0xfffff0];
const NPC_TINTS = [0xffffff, 0xffcccc, 0xeed0ff, 0xffd9a0, 0xc8f5c8, 0xdddddd];

let manifestCache = LPC_MANIFEST?.characters ? LPC_MANIFEST : null;

export function getLpcManifest() {
  return manifestCache;
}

export function resolveLpcManifestFromCache() {
  if (!manifestCache && LPC_MANIFEST?.characters) manifestCache = LPC_MANIFEST;
  return manifestCache;
}

export function queueLpcCharacterSheets(scene) {
  const manifest = resolveLpcManifestFromCache();
  if (!manifest) return false;

  for (const [id, def] of Object.entries(manifest.characters)) {
    const key = def.texture || `lpc-${id}`;
    if (scene.textures.exists(key)) continue;
    scene.load.spritesheet(key, def.path, {
      frameWidth: manifest.frameWidth || LPC_FRAME_W,
      frameHeight: manifest.frameHeight || LPC_FRAME_H,
    });
  }
  return true;
}

export function ensureLpcTextureFilter(scene) {
  const manifest = getLpcManifest();
  if (!manifest) return;
  for (const def of Object.values(manifest.characters)) {
    const tex = scene.textures.get(def.texture);
    if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

export function setupLpcAnimations(scene) {
  const manifest = getLpcManifest();
  if (!manifest) return;

  const walk = LPC_WALK_DIRS;
  const fw = manifest.frameWidth || LPC_FRAME_W;
  const fh = manifest.frameHeight || LPC_FRAME_H;

  for (const [id, def] of Object.entries(manifest.characters)) {
    const key = def.texture || `lpc-${id}`;
    if (!scene.textures.exists(key)) continue;

    for (const [dir, range] of Object.entries(walk)) {
      const animKey = `${key}-walk-${dir}`;
      if (scene.anims.exists(animKey)) continue;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, {
          start: range.start,
          end: range.end,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${key}-idle`)) {
      scene.anims.create({
        key: `${key}-idle`,
        frames: [{ key, frame: walk.down?.start ?? 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    void fw;
    void fh;
  }
}

export function resolveRoleCharacterId(manifest, kind, variant = 0) {
  if (!manifest?.roles) return null;
  const role = manifest.roles[kind];
  if (!role) return null;
  if (typeof role === 'string') return role;
  if (Array.isArray(role)) return role[variant % role.length];
  return null;
}

export function getCharacterDef(manifest, characterId) {
  return manifest?.characters?.[characterId] ?? null;
}

export function applyLpcCharacter(sprite, characterId, scene, opts = {}) {
  const manifest = getLpcManifest();
  if (!manifest) return false;

  const def = getCharacterDef(manifest, characterId);
  if (!def) return false;

  const key = def.texture || `lpc-${characterId}`;
  if (!scene.textures.exists(key)) return false;

  sprite.setTexture(key);
  sprite.setData('lpcCharacterId', characterId);
  sprite.clearTint();

  const { kind, variant = 0, tint } = opts;
  const defTint = def.tint;
  if (defTint != null && defTint !== 0xffffff) sprite.setTint(defTint);
  else if (tint != null && tint !== 0xffffff) sprite.setTint(tint);
  else if (kind === 'bot') sprite.setTint(BOT_TINTS[variant % BOT_TINTS.length]);
  else if (kind === 'remote') sprite.setTint(0xbb86fc + ((variant * 997) % 0x333333));

  sprite.setScale(def.scale ?? 0.5);

  const idle = `${key}-idle`;
  if (scene.anims.exists(idle)) sprite.anims.play(idle, true);

  return true;
}

export function updateLpcWalkAnim(sprite, dx, dy, scene) {
  const characterId = sprite.getData('lpcCharacterId');
  if (!characterId) return false;

  const manifest = getLpcManifest();
  const def = getCharacterDef(manifest, characterId);
  if (!def) return false;

  const key = def.texture || `lpc-${characterId}`;
  const dir = lpcWalkDirection(dx, dy);

  if (!dir) {
    sprite.anims?.pause();
    return true;
  }

  sprite.setFlipX(false);
  const animKey = `${key}-walk-${dir}`;
  if (scene.anims.exists(animKey)) {
    if (!sprite.anims.isPlaying || sprite.anims.currentAnim?.key !== animKey) {
      sprite.anims.play(animKey, true);
    }
    return true;
  }
  return false;
}
