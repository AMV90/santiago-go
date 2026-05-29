/**
 * Personaxes: LPC (Universal Spritesheet Generator) + fallback procedural.
 * Xera / actualiza LPC: npm run lpc:sync && npm run sprites:lpc
 */

import { queuePeleteiroTileset } from './interiors/peleteiro-tile-render.js';
import {
  queueAllPeleteiroForgeAssets,
  preloadPeleteiroForgeManifests,
} from './interiors/peleteiro-forge-render.js';
import {
  resolveLpcManifestFromCache,
  queueLpcCharacterSheets,
  ensureLpcTextureFilter,
  setupLpcAnimations,
  resolveRoleCharacterId,
  applyLpcCharacter,
  updateLpcWalkAnim,
  getLpcManifest,
} from './lpc-sprites.js';

const SPRITE_PATHS = {
  player: 'assets/sprites/player.png',
  bot: 'assets/sprites/bot.png',
  npc: 'assets/sprites/npc.png',
  remote: 'assets/sprites/remote.png',
};

const NPC_PALETTES = [
  { shirt: 0xe74c3c, pants: 0x5a3030, hair: 0x782828, accent: 0xffb450 },
  { shirt: 0x9b59b6, pants: 0x4a3560, hair: 0x5a2878, accent: 0xd4a5ff },
  { shirt: 0xe67e22, pants: 0x6a4520, hair: 0x4a3018, accent: 0xffcc80 },
  { shirt: 0x16a085, pants: 0x1a5048, hair: 0x2a4038, accent: 0x80ffc0 },
  { shirt: 0xf39c12, pants: 0x6a5020, hair: 0x503010, accent: 0xffe082 },
  { shirt: 0xc0392b, pants: 0x501818, hair: 0x301010, accent: 0xff9080 },
];

function drawCharacterFrame(g, ox, palette, style, frame = 0) {
  const skin = 0xffdbac;
  const skinShade = 0xe8b896;
  const bob = frame === 2 ? 0 : 1;
  const legSwing = frame % 2 === 0 ? 0 : frame === 1 ? -1 : 1;
  const baseY = 4 + bob;

  g.fillStyle(0x000000, 0.22);
  g.fillRect(ox + 4, 22, 8, 1);
  g.fillStyle(palette.hair, 1);
  g.fillRect(ox + 4, baseY, 8, 3);
  g.fillRect(ox + 3, baseY + 2, 10, 2);
  g.fillStyle(skin, 1);
  g.fillRect(ox + 5, baseY + 3, 6, 5);
  g.fillStyle(skinShade, 1);
  g.fillRect(ox + 9, baseY + 6, 1, 2);
  g.fillStyle(0x14141e, 1);
  g.fillRect(ox + 6, baseY + 5, 1, 1);
  g.fillRect(ox + 9, baseY + 5, 1, 1);
  g.fillStyle(0xc08060, 1);
  g.fillRect(ox + 7, baseY + 7, 2, 1);
  g.fillStyle(skin, 1);
  g.fillRect(ox + 7, baseY + 8, 2, 1);
  g.fillStyle(palette.shirt, 1);
  g.fillRect(ox + 4, baseY + 9, 8, 6);
  if (style === 'player') {
    g.fillStyle(palette.accent, 1);
    g.fillRect(ox + 7, baseY + 10, 2, 4);
  }
  if (style === 'remote') {
    g.fillStyle(palette.accent, 1);
    g.fillRect(ox + 4, baseY + 9, 8, 2);
  }
  if (style === 'npc') {
    g.fillStyle(palette.accent, 1);
    g.fillRect(ox + 3, baseY + 8, 10, 2);
  }
  if (style === 'bot') {
    g.fillStyle(palette.accent, 1);
    g.fillRect(ox + 6, baseY + 7, 4, 1);
  }
  g.fillStyle(palette.pants, 1);
  g.fillRect(ox + 5 + legSwing, baseY + 15, 3, 6);
  g.fillRect(ox + 9 - legSwing, baseY + 15, 3, 6);
  g.fillStyle(palette.shoes, 1);
  g.fillRect(ox + 5 + legSwing, baseY + 20, 3, 2);
  g.fillRect(ox + 9 - legSwing, baseY + 20, 3, 2);
}

export function queueSpriteAssets(scene) {
  queuePeleteiroTileset(scene);
  queueAllPeleteiroForgeAssets(scene);
  preloadPeleteiroForgeManifests();
  resolveLpcManifestFromCache();
  const hasLpc = queueLpcCharacterSheets(scene);

  scene.registry.set('spriteMode', hasLpc ? 'lpc' : 'legacy');
  scene.registry.set('hasSheetPlayer', false);
  scene.registry.set('hasSheetBot', false);
  scene.registry.set('hasSheetNpc', false);
  scene.registry.set('hasSheetRemote', false);

  // Sen LPC: PNG 16×24 legacy. Con LPC non cargar assets/sprites/*.png (son 576×256 e bloquean o loader).
  if (!hasLpc) {
    const legacySheets = [
      ['sheet-player', SPRITE_PATHS.player],
      ['sheet-bot', SPRITE_PATHS.bot],
      ['sheet-npc', SPRITE_PATHS.npc],
      ['sheet-remote', SPRITE_PATHS.remote],
    ];

    scene.load.on('filecomplete-spritesheet-sheet-player', () =>
      scene.registry.set('hasSheetPlayer', true)
    );
    scene.load.on('filecomplete-spritesheet-sheet-bot', () => scene.registry.set('hasSheetBot', true));
    scene.load.on('filecomplete-spritesheet-sheet-npc', () => scene.registry.set('hasSheetNpc', true));
    scene.load.on('filecomplete-spritesheet-sheet-remote', () =>
      scene.registry.set('hasSheetRemote', true)
    );

    for (const [key, path] of legacySheets) {
      scene.load.spritesheet(key, path, { frameWidth: 16, frameHeight: 24 });
    }
  }
}

export function createFallbackTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const playerPal = {
    hair: 0x2d3446,
    shirt: 0x3d8bfd,
    pants: 0x2c3e50,
    shoes: 0x1e1e28,
    accent: 0xf4d35e,
  };
  const botPal = {
    hair: 0x503523,
    shirt: 0x2ecc71,
    pants: 0x275642,
    shoes: 0x193222,
    accent: 0xc8ffdc,
  };
  const npcPal = {
    hair: 0x782828,
    shirt: 0xe74c3c,
    pants: 0x5a3030,
    shoes: 0x321e1e,
    accent: 0xffb450,
  };
  const remotePal = {
    hair: 0x5a3c8c,
    shirt: 0x9b59b6,
    pants: 0x463264,
    shoes: 0x281e3c,
    accent: 0xc8a0ff,
  };

  for (let i = 0; i < 6; i++) {
    const p = NPC_PALETTES[i];
    drawCharacterFrame(g, 0, { ...p, shoes: 0x1e1e28 }, 'npc', 0);
    g.generateTexture(`npc-${i}`, 16, 24);
    g.clear();
  }
  drawCharacterFrame(g, 0, playerPal, 'player', 0);
  g.generateTexture('char-player', 16, 24);
  g.clear();
  drawCharacterFrame(g, 0, botPal, 'bot', 0);
  g.generateTexture('char-bot', 16, 24);
  g.clear();
  drawCharacterFrame(g, 0, npcPal, 'npc', 0);
  g.generateTexture('char-npc', 16, 24);
  g.clear();
  drawCharacterFrame(g, 0, remotePal, 'remote', 0);
  g.generateTexture('char-remote', 16, 24);
  g.clear();

  g.fillStyle(0x8b4513, 1);
  g.fillRect(2, 6, 14, 12);
  g.fillStyle(0x1a1a1a, 1);
  g.fillRect(10, 2, 6, 6);
  g.generateTexture('dog-wild', 18, 18);
  g.clear();
  g.fillStyle(0xc68642, 1);
  g.fillRect(2, 6, 14, 12);
  g.generateTexture('dog-companion', 18, 18);
  g.destroy();
}

function setupLegacyWalkAnimations(scene) {
  for (const key of ['sheet-player', 'sheet-bot', 'sheet-npc', 'sheet-remote']) {
    if (!scene.textures.exists(key)) continue;
    if (!scene.anims.exists(`${key}-walk`)) {
      scene.anims.create({
        key: `${key}-walk`,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}

export function setupSpriteAnimations(scene) {
  resolveLpcManifestFromCache();
  if (getLpcManifest()) {
    setupLpcAnimations(scene);
  }
  setupLegacyWalkAnimations(scene);
}

export function resolveSpriteKeys(scene) {
  const manifest = getLpcManifest();
  const pickLpc = (kind) => {
    const id = resolveRoleCharacterId(manifest, kind, 0);
    if (!id) return null;
    const def = manifest.characters[id];
    return def?.texture && scene.textures.exists(def.texture) ? def.texture : null;
  };

  const pickLegacy = (sheetKey, fallbackKey) =>
    scene.textures.exists(sheetKey) ? sheetKey : fallbackKey;

  const keys = {
    player: pickLpc('player') || pickLegacy('sheet-player', 'char-player'),
    bot: pickLpc('bot') || pickLegacy('sheet-bot', 'char-bot'),
    npc: pickLpc('npc') || pickLegacy('sheet-npc', 'char-npc'),
    remote: pickLpc('remote') || pickLegacy('sheet-remote', 'char-remote'),
  };
  scene.registry.set('spriteKeys', keys);
  scene.registry.set('spriteMode', manifest ? 'lpc' : 'legacy');
  return keys;
}

/**
 * @param {Phaser.GameObjects.Sprite} sprite
 * @param {'player'|'bot'|'npc'|'remote'} kind
 * @param {object} [opts] lpcId, tint
 */
export function applyCharacterSprite(sprite, kind, scene, variant = 0, opts = {}) {
  const manifest = getLpcManifest();
  const characterId = opts.lpcId ?? resolveRoleCharacterId(manifest, kind, variant);

  if (manifest && characterId && applyLpcCharacter(sprite, characterId, scene, { kind, variant, tint: opts.tint })) {
    const npcRef = sprite.getData('npc');
    if (npcRef) {
      npcRef.characterId = characterId;
      npcRef.lpcId = characterId;
    }
    return;
  }

  const keys = scene.registry.get('spriteKeys') || resolveSpriteKeys(scene);
  const key = keys[kind] || keys.player;
  const fallbackId =
    characterId || resolveRoleCharacterId(manifest, kind, variant) || null;
  sprite.setTexture(key);
  sprite.setData('lpcCharacterId', fallbackId);
  sprite.setScale(kind === 'bot' ? 1.5 : 1.35);
  sprite.clearTint();

  const npcRef = sprite.getData('npc');
  if (npcRef && fallbackId) {
    npcRef.characterId = fallbackId;
    npcRef.lpcId = fallbackId;
  }

  if (kind === 'bot') sprite.setTint(0xffffff);
  if (kind === 'npc' && !keys.npc.startsWith('sheet-') && !keys.npc.startsWith('lpc-')) {
    sprite.setTexture(`npc-${variant % 6}`);
  } else if (kind === 'npc') {
    sprite.setTint(0xffffff);
  }
  if (kind === 'remote') sprite.setTint(0xbb86fc);

  const sheetKey = keys[kind];
  if (sheetKey?.startsWith('sheet-') && scene.anims.exists(`${sheetKey}-walk`)) {
    sprite.anims.play(`${sheetKey}-walk`, true);
  }
}

export function updateWalkAnim(sprite, dx, dy, scene, kind = 'bot') {
  if (sprite.getData('lpcCharacterId') && updateLpcWalkAnim(sprite, dx, dy, scene)) {
    return;
  }

  const keys = scene.registry.get('spriteKeys');
  if (!keys) return;
  const sheetKey = keys[kind];
  if (!sheetKey?.startsWith('sheet-')) return;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    sprite.anims?.pause();
    return;
  }
  if (dx < 0) sprite.setFlipX(true);
  else if (dx > 0) sprite.setFlipX(false);
  if (!sprite.anims?.isPlaying) sprite.anims?.play(`${sheetKey}-walk`, true);
}

export { ensureLpcTextureFilter, getLpcManifest };
