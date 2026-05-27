import { resolveWorldPosition } from './world-position.js';
import { createExitCheck } from './interior-exits.js';
import { createInteriorActors } from './interior-actors.js';

/**
 * Converte unha PlaceDefinition en runtime config para interior-zone.
 */
export function compilePlace(place) {
  const layout =
    typeof place.layout === 'function' ? place.layout() : place.layout;

  const actorsRuntime = place.actors
    ? createInteriorActors(place.id, layout, place.actors)
    : null;

  return {
    id: place.id,
    label: place.label,
    tileSize: layout.tileSize,
    rows: layout.rows,
    width: layout.width,
    height: layout.height,
    colors: layout.colors,
    tileColors: layout.colors,
    isBlocked: layout.isBlocked.bind(layout),
    getTileAt: layout.getTileAt.bind(layout),
    getEntrySpawn: layout.getEntrySpawn.bind(layout),
    isExitTile: layout.isExitTile.bind(layout),
    drawTileExtra: layout.drawTileExtra,
    enterToast: place.enterToast,
    exitToast: place.exitToast,
    door: place.door,
    getReturnPosition: (scene) => resolveWorldPosition(place.world, scene),
    onEnter: (scene) => actorsRuntime?.enter(scene),
    onExit: (scene) => actorsRuntime?.exit(scene),
    onUpdate: (scene, delta, showToast, onBattleEnd) =>
      actorsRuntime?.update(scene, delta, showToast, onBattleEnd),
    setVisible: (scene, visible) => actorsRuntime?.setVisible(scene, visible),
    shouldExit: createExitCheck(place.exit, layout),
  };
}
