import { requestNavigateTo } from './path-navigation.js';
import { isBattleOpen } from './battle-ui.js';
import { isInInterior } from './interior-zone.js';
import { isMapTapSlop } from './camera-pan.js';

/**
 * Clic / tap no mapa principal → ruta calculada no servidor (A*).
 * En móbil: só conta como tap se non houbo pinch/pan.
 */
export function setupMapClickNavigation(scene) {
  scene.input.on('pointerdown', (pointer) => {
    if (isInInterior(scene)) return;
    if (scene.inBattle || isBattleOpen()) return;
    if (pointer.pointerType === 'mouse' && !pointer.leftButtonDown()) return;

    scene._mapTapPending = {
      id: pointer.id,
      x: pointer.x,
      y: pointer.y,
    };
  });

  scene.input.on('pointerup', (pointer) => {
    const pending = scene._mapTapPending;
    if (!pending || pending.id !== pointer.id) return;
    scene._mapTapPending = null;

    if (isInInterior(scene)) return;
    if (scene.inBattle || isBattleOpen()) return;

    if (scene.input.pointer1?.isDown || scene.input.pointer2?.isDown) return;

    if (scene._touchCameraGesture) {
      scene._touchCameraGesture = false;
      return;
    }

    if (!isMapTapSlop(scene, pointer, pending.x, pending.y)) return;

    const cam = scene.cameras.main;
    const world = cam.getWorldPoint(pointer.x, pointer.y);

    if (scene.navClickMarker) scene.navClickMarker.destroy();
    scene.navClickMarker = scene.add.circle(world.x, world.y, 3, 0xf4d35e, 0.28);
    scene.navClickMarker.setStrokeStyle(1, 0x2c3e50, 0.35);
    scene.navClickMarker.setDepth(25);

    requestNavigateTo(scene, world.x, world.y);
  });
}
