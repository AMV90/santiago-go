/**
 * Regras de saída reutilizables por instancia.
 * exit: { kind: 'south'|'west'|'north'|'east', margin?: number }
 */
export function createExitCheck(exitDef, layout) {
  const margin = exitDef?.margin ?? 2.5;
  const tile = layout.tileSize;

  return (scene, tx, ty, player) => {
    if (!layout.isExitTile(tx, ty)) return false;

    const keyE = Phaser.Input.Keyboard.JustDown(scene.keyE);
    const kind = exitDef?.kind ?? 'south';

    switch (kind) {
      case 'west':
        return (
          scene.cursors.left.isDown ||
          scene.wasd.A.isDown ||
          player.x < tile * margin ||
          keyE
        );
      case 'north':
        return (
          scene.cursors.up.isDown ||
          scene.wasd.W.isDown ||
          player.y < tile * margin ||
          keyE
        );
      case 'east':
        return (
          scene.cursors.right.isDown ||
          scene.wasd.D.isDown ||
          player.x > layout.width - tile * margin ||
          keyE
        );
      case 'south':
      default:
        return (
          scene.cursors.down.isDown ||
          scene.wasd.S.isDown ||
          player.y > layout.height - tile * margin ||
          keyE
        );
    }
  };
}
