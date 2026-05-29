import { requestNavigateTo } from './path-navigation.js';
import { isBattleOpen } from './battle-ui.js';
import { isInInterior } from './interior-zone.js';

/**
 * Clic no mapa principal → ruta calculada no servidor (A*).
 */
export function setupMapClickNavigation(scene) {
  scene.input.on('pointerdown', (pointer) => {
    if (!pointer.leftButtonDown()) return;
    if (isInInterior(scene)) return;
    if (scene.inBattle || isBattleOpen()) return;

    const cam = scene.cameras.main;
    const world = cam.getWorldPoint(pointer.x, pointer.y);

    if (scene.navClickMarker) scene.navClickMarker.destroy();
    scene.navClickMarker = scene.add.circle(world.x, world.y, 3, 0xf4d35e, 0.28);
    scene.navClickMarker.setStrokeStyle(1, 0x2c3e50, 0.35);
    scene.navClickMarker.setDepth(25);

    requestNavigateTo(scene, world.x, world.y);
  });
}
