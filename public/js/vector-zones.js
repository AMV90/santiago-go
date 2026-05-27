import { project, CATEGORY_COLORS } from './geo.js';

function projLonLat(mapData, coord) {
  const [lon, lat] = coord;
  return project(lon, lat, mapData.width, mapData.height, mapData.bounds);
}

function drawLineString(gfx, mapData, coords, firstColor) {
  if (!coords?.length) return;
  gfx.beginPath();
  const p0 = projLonLat(mapData, coords[0]);
  gfx.moveTo(p0.x, p0.y);
  for (let i = 1; i < coords.length; i++) {
    const pi = projLonLat(mapData, coords[i]);
    gfx.lineTo(pi.x, pi.y);
  }
  gfx.strokePath();
}

function drawPolygon(gfx, mapData, rings) {
  if (!rings?.length) return;
  const outer = rings[0];
  if (!outer?.length) return;

  gfx.beginPath();
  const p0 = projLonLat(mapData, outer[0]);
  gfx.moveTo(p0.x, p0.y);
  for (let i = 1; i < outer.length; i++) {
    const pi = projLonLat(mapData, outer[i]);
    gfx.lineTo(pi.x, pi.y);
  }
  gfx.closePath?.();
  gfx.fillPath?.();
  gfx.strokePath?.();
}

function drawMultiPolygon(gfx, mapData, polygons) {
  for (const poly of polygons || []) {
    drawPolygon(gfx, mapData, poly?.coordinates || poly);
  }
}

/**
 * Dibuixa as zonas vectoriais (edificios + locales) para parecerse ao panel de deseño.
 * Non se recalcula en cada frame: é “estático” sobre o mundo.
 */
export function drawVectorZones(scene, mapDesignGeo) {
  const mapData = scene.mapData;
  if (!mapDesignGeo) return null;

  const buildingsGfx = scene.add.graphics();
  buildingsGfx.setDepth(1.5);
  buildingsGfx.fillStyle(0x6c7a9c, 0.28);
  buildingsGfx.lineStyle(1, 0x4a5568, 0.25);

  const bFeatures = mapDesignGeo.buildings?.features || [];
  for (let i = 0; i < bFeatures.length; i++) {
    const f = bFeatures[i];
    const g = f?.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') drawPolygon(buildingsGfx, mapData, g.coordinates);
    else if (g.type === 'MultiPolygon') drawMultiPolygon(buildingsGfx, mapData, g.coordinates);
  }

  const localesGfx = scene.add.graphics();
  localesGfx.setDepth(1.7);

  const lFeatures = mapDesignGeo.locales?.features || [];
  for (let i = 0; i < lFeatures.length; i++) {
    const f = lFeatures[i];
    const g = f?.geometry;
    if (!g || g.type !== 'Point') continue;

    const cat = f?.properties?.category;
    const colorStr = CATEGORY_COLORS[cat] || CATEGORY_COLORS.local;
    const color = Number.parseInt(colorStr.replace('#', ''), 16);

    const p = projLonLat(mapData, g.coordinates);
    localesGfx.fillStyle(color, 0.95);
    localesGfx.lineStyle(1, 0xffffff, 0.75);
    localesGfx.fillCircle?.(p.x, p.y, 2.2);
    localesGfx.strokeCircle?.(p.x, p.y, 2.2);
  }

  return { buildingsGfx, localesGfx };
}

