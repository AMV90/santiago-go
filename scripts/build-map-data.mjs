import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

import { MAP_BOUNDS, MAP_WIDTH, MAP_HEIGHT } from '../public/js/map-bounds.js';
function findObradoiroSpawn(streets) {
  const s = streets.find((x) => x.name === 'Praza do Obradoiro' && x.points?.length >= 2);
  if (!s) return null;
  const mid = s.points[Math.floor(s.points.length / 2)];
  return { x: mid.x, y: mid.y, label: 'Praza do Obradoiro — Catedral' };
}

const BOUNDS = MAP_BOUNDS;
const WIDTH = MAP_WIDTH;
const HEIGHT = MAP_HEIGHT;

function project(lon, lat) {
  return {
    x: Math.round(((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * WIDTH),
    y: Math.round(((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * HEIGHT),
  };
}

/** Reduce puntos nas rúas = menos RAM e menos trazos */
function simplifyPoints(points, minDist = 16) {
  if (points.length <= 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1];
    const p = points[i];
    if (Math.hypot(p.x - prev.x, p.y - prev.y) >= minDist) out.push(p);
  }
  out.push(points[points.length - 1]);
  return out;
}

function categorize(tags) {
  if (tags.shop) return 'comercio';
  if (tags.tourism === 'museum' || tags.tourism === 'attraction') return 'turismo';
  if (tags.tourism === 'hotel' || tags.tourism === 'hostel') return 'alojamiento';
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'bar')
    return 'hostelería';
  if (tags.amenity === 'pharmacy') return 'farmacia';
  if (tags.amenity === 'bank' || tags.amenity === 'atm') return 'banco';
  if (tags.tourism === 'information') return 'información';
  return 'local';
}

function wayToCoords(geometry) {
  return geometry.map((g) => [g.lon, g.lat]);
}

const rawPath = path.join(root, 'data', 'osm-raw.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const streets = [];
const buildings = [];
const locales = [];
const geoStreets = [];
const geoBuildings = [];
const geoLocales = [];

for (const el of raw.elements) {
  if (el.type === 'way' && el.geometry?.length >= 2) {
    if (el.tags?.highway) {
      const name =
        el.tags.name ||
        el.tags['name:gl'] ||
        el.tags['name:es'] ||
        el.tags.ref ||
        null;
      const points = simplifyPoints(el.geometry.map((g) => project(g.lon, g.lat)));
      streets.push({
        id: el.id,
        name,
        highway: el.tags.highway,
        points,
      });
      geoStreets.push({
        type: 'Feature',
        properties: { id: el.id, name, highway: el.tags.highway },
        geometry: { type: 'LineString', coordinates: wayToCoords(el.geometry) },
      });
    }
    if (el.tags?.building) {
      const points = el.geometry.map((g) => project(g.lon, g.lat));
      const closed = [...points];
      if (closed[0].x !== closed.at(-1).x || closed[0].y !== closed.at(-1).y) {
        closed.push({ ...closed[0] });
      }
      buildings.push({
        id: el.id,
        name: el.tags.name || null,
        building: el.tags.building,
        points: closed,
      });
      const ring = wayToCoords(el.geometry);
      if (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) {
        ring.push(ring[0]);
      }
      geoBuildings.push({
        type: 'Feature',
        properties: { id: el.id, name: el.tags.name, building: el.tags.building },
        geometry: { type: 'Polygon', coordinates: [ring] },
      });
    }
  }

  if (el.type === 'node' && el.lat != null && el.tags?.name) {
    const isLocale =
      el.tags.shop ||
      el.tags.amenity ||
      el.tags.tourism ||
      el.tags.office;
    if (!isLocale) continue;

    const p = project(el.lon, el.lat);
    const category = categorize(el.tags);
    locales.push({
      id: el.id,
      name: el.tags.name,
      category,
      amenity: el.tags.amenity,
      shop: el.tags.shop,
      tourism: el.tags.tourism,
      street: el.tags['addr:street'],
      x: p.x,
      y: p.y,
    });
    geoLocales.push({
      type: 'Feature',
      properties: {
        id: el.id,
        name: el.tags.name,
        category,
      },
      geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
    });
  }
}

const namedStreets = streets.filter((s) => s.name).length;

const mapData = {
  meta: {
    title: 'Área metropolitana de Santiago',
    spawn:
      findObradoiroSpawn(streets) || {
        ...project(-8.544629, 42.88066),
        label: 'Catedral de Santiago',
      },
    source: 'OpenStreetMap © contribuidores (ODbL)',
    bounds: BOUNDS,
    width: WIDTH,
    height: HEIGHT,
    generatedAt: new Date().toISOString(),
    counts: {
      streets: streets.length,
      streetsNamed: namedStreets,
      buildings: buildings.length,
      locales: locales.length,
    },
  },
  bounds: BOUNDS,
  width: WIDTH,
  height: HEIGHT,
  streets,
  buildings,
  locales,
};

const geojson = {
  streets: { type: 'FeatureCollection', features: geoStreets },
  buildings: { type: 'FeatureCollection', features: geoBuildings },
  locales: { type: 'FeatureCollection', features: geoLocales },
};

const dataDir = path.join(root, 'data');
const outDir = path.join(root, 'public');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'map-data.json'), JSON.stringify(mapData));
fs.writeFileSync(path.join(outDir, 'map-design.geojson'), JSON.stringify(geojson));

console.log('Mapa generado:');
console.log(`  Calles: ${streets.length} (${namedStreets} con nombre)`);
console.log(`  Edificios: ${buildings.length}`);
console.log(`  Locales: ${locales.length}`);
