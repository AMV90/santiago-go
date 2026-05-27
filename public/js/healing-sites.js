import { project } from './geo.js';
import { MAP_BOUNDS, MAP_WIDTH, MAP_HEIGHT } from './map-bounds.js';
import { attachWorldTooltip, hideWorldTooltip } from './world-tooltip.js';
import { enterInterior, isInInterior } from './interior-zone.js';
import { clearNavigation } from './path-navigation.js';

import { HEALING_SITES } from './healing-sites-data.js';

export { HEALING_SITES };

function worldPos(site) {
  const p = project(site.lon, site.lat, MAP_WIDTH, MAP_HEIGHT, MAP_BOUNDS);
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

export function interiorIdForSite(site) {
  return `hospital-${site.id}`;
}

export function initHealingMarkers(scene, showToast) {
  scene.healingSprites = scene.healingSprites || [];

  for (const site of HEALING_SITES) {
    const pos = worldPos(site);
    site.x = pos.x;
    site.y = pos.y;

    const spr = scene.add.image(site.x, site.y, 'first-aid');
    spr.setDepth(8);
    spr.setScale(0.55);
    spr.setOrigin(0.5, 0.9);
    spr.setData('site', site);
    spr.setInteractive({ useHandCursor: true });
    const tooltip = attachWorldTooltip(scene, spr, site.name, {
      offsetY: -28,
      depth: 12,
      backgroundColor: 'rgba(39, 174, 96, 0.94)',
    });
    spr.setData('worldTooltip', tooltip);
    spr.on('pointerdown', (pointer) => {
      pointer.event?.stopPropagation();
      hideWorldTooltip(spr);
      if (scene.inBattle || scene.interiorTransition || isInInterior(scene)) return;
      clearNavigation(scene);
      enterInterior(scene, interiorIdForSite(site), showToast);
    });

    const label = scene.add.text(site.x, site.y - 22, site.shortName, {
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(39, 174, 96, 0.92)',
      padding: { x: 6, y: 3 },
    });
    label.setOrigin(0.5, 1);
    label.setDepth(9);
    label.setData('site', site);

    scene.healingSprites.push({ spr, label, site });
  }
}

export function updateHealingMarkers(scene) {
  if (!scene.healingSprites?.length) return;

  for (const item of scene.healingSprites) {
    const { site, label } = item;
    label.setPosition(site.x, site.y - 22);
  }
}

export function destroyHealingMarkers(scene) {
  scene?.healingSprites?.forEach((x) => {
    x.spr?.destroy();
    x.label?.destroy();
  });
  if (scene) scene.healingSprites = [];
}
