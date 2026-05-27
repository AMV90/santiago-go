import { clearNavigation } from '../path-navigation.js';
import { enterInterior, isInInterior } from '../interior-zone.js';
import { attachWorldTooltip, hideWorldTooltip } from '../world-tooltip.js';
import { resolveDoorPosition } from './world-position.js';
import { getPlaceDefinitions } from './index.js';

function createDoorTexture(scene, key, drawFn, w = 14, h = 18) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function spawnDoor(scene, place, showToast) {
  if (!place.door) return null;

  const { door } = place;
  const pos = resolveDoorPosition(place.world, scene);

  createDoorTexture(scene, door.textureKey, door.draw);

  const sprite = scene.add.sprite(pos.x, pos.y, door.textureKey);
  sprite.setOrigin(0.5, 0.5);
  sprite.setDepth(25);
  sprite.setInteractive({
    useHandCursor: true,
    hitArea: new Phaser.Geom.Rectangle(-10, -12, 20, 24),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
  });

  const tip = attachWorldTooltip(scene, sprite, door.tooltip, {
    offsetY: -14,
    depth: 30,
  });
  sprite.setData('worldTooltip', tip);
  sprite.setData('placeId', place.id);

  sprite.on('pointerdown', (pointer) => {
    pointer.event?.stopPropagation();
    tip.hide();
    if (scene.inBattle || scene.interiorTransition || isInInterior(scene)) return;
    clearNavigation(scene);
    enterInterior(scene, place.id, showToast);
  });

  if (door.sceneKey) scene[door.sceneKey] = sprite;
  return sprite;
}

/** Crea todas as portas do mapa a partir do rexistro de lugares */
export function initAllPlaceDoors(scene, showToast) {
  scene.placeDoors = scene.placeDoors || new Map();

  for (const place of getPlaceDefinitions()) {
    if (!place.door || scene.placeDoors.has(place.id)) continue;
    const door = spawnDoor(scene, place, showToast);
    if (door) scene.placeDoors.set(place.id, door);
  }
}

export function setPlaceDoorsVisible(scene, visible) {
  scene.placeDoors?.forEach((door) => {
    door.setVisible(visible);
    hideWorldTooltip(door);
  });
}
