/** Malinois Forge (generate2dsprite player_sheet 4×4) — casiña misteriosa */

export const CASINA_MALINOIS_ASSETS = [
  {
    key: 'casina-malinois-1',
    path: 'assets/sprites/casina/malinois-1-run/sheet-transparent.png',
  },
  {
    key: 'casina-malinois-2',
    path: 'assets/sprites/casina/malinois-2-run/sheet-transparent.png',
  },
];

/** Forge player_sheet: fila 0 abaixo, 1 esquerda, 2 dereita, 3 arriba (4 frames por fila). */
const FRAME = 128;

export const MALINOIS_WALK_DIRS = {
  down: { start: 0, end: 3 },
  left: { start: 4, end: 7 },
  right: { start: 8, end: 11 },
  up: { start: 12, end: 15 },
};

export function queueCasinaMalinoisAssets(scene) {
  for (const { key, path } of CASINA_MALINOIS_ASSETS) {
    if (scene.textures.exists(key)) continue;
    scene.load.spritesheet(key, path, { frameWidth: FRAME, frameHeight: FRAME });
  }
}

export function ensureCasinaMalinoisAnims(scene) {
  for (const { key } of CASINA_MALINOIS_ASSETS) {
    if (!scene.textures.exists(key)) continue;
    for (const [dir, range] of Object.entries(MALINOIS_WALK_DIRS)) {
      const animKey = `${key}-walk-${dir}`;
      if (scene.anims.exists(animKey)) continue;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, range),
        frameRate: 7,
        repeat: -1,
      });
    }
  }
}

export function malinoisWalkAnimKey(textureKey, facing) {
  return `${textureKey}-walk-${facing}`;
}
