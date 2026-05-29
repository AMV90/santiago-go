/** Malinois Forge (generate2dsprite) — casiña misteriosa */

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

const FRAME = 128;

export function queueCasinaMalinoisAssets(scene) {
  for (const { key, path } of CASINA_MALINOIS_ASSETS) {
    if (scene.textures.exists(key)) continue;
    scene.load.spritesheet(key, path, { frameWidth: FRAME, frameHeight: FRAME });
  }
}

export function ensureCasinaMalinoisAnims(scene) {
  for (const { key } of CASINA_MALINOIS_ASSETS) {
    const animKey = `${key}-walk`;
    if (scene.anims.exists(animKey)) continue;
    if (!scene.textures.exists(key)) continue;
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
  }
}
