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
    requestNavigateTo(scene, world.x, world.y);
  });
}
