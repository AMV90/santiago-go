/**
 * Tooltip flotante encima dun icono do mapa (Phaser, coordenadas mundo).
 */
export function attachWorldTooltip(scene, target, text, opts = {}) {
  const offsetY = opts.offsetY ?? -16;
  let tooltip = null;

  const hide = () => {
    if (tooltip) {
      tooltip.destroy();
      tooltip = null;
    }
  };

  const show = () => {
    if (!target.active || !target.visible) return;
    hide();
    tooltip = scene.add.text(target.x, target.y + offsetY, text, {
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      fontSize: opts.fontSize || '11px',
      color: opts.color || '#fff8e7',
      backgroundColor: opts.backgroundColor || 'rgba(46, 34, 20, 0.94)',
      padding: { x: 8, y: 4 },
    });
    tooltip.setOrigin(0.5, 1);
    tooltip.setDepth(opts.depth ?? 28);
    tooltip.setScrollFactor(1);
  };

  const sync = () => {
    if (tooltip?.active && target.active) {
      tooltip.setPosition(target.x, target.y + offsetY);
    }
  };

  target.on('pointerover', show);
  target.on('pointerout', hide);
  target.on('destroy', hide);

  return { show, hide, sync, getEl: () => tooltip };
}

export function hideWorldTooltip(target) {
  target?.getData?.('worldTooltip')?.hide?.();
}
