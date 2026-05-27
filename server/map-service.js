import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildStreetGraph } from '../public/js/street-graph.js';
import { buildStreetWalker } from '../public/js/street-walk.js';
import { resolveSpawnPoint } from '../public/js/spawn-resolver.js';
import { spawnNpcs, respawnNpcAtLevel } from '../public/js/npcs.js';
import { spawnWorldPickups } from '../public/js/world-pickups.js';
import { spawnDogs } from '../public/js/dog-system.js';
import { spawnWalkBots, buildWanderPoints, buildWanderPointsNearSpawn, compactWalkBots } from '../public/js/walk-bots.js';
import {
  MAP_SAVE_VERSION,
  BATTLE_NPC_COUNT,
  FONTINAS_BANDIT_COUNT,
  PICKUP_COUNT,
  WALK_BOT_COUNT,
} from '../public/js/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Radio de carga — debe incluir TODAS as rúas do radio (sen cortar) */
const CHUNK_RADIUS_DEFAULT = 2600;
const BOOTSTRAP_RADIUS = 2200;
const MINIMAP_MAX_STREETS = 1200;

let mapData = null;
let streetGraph = null;
let streetWalker = null;
let world = null;
let wanderPoints = null;
let mapReady = false;
let mapInitError = null;

export function isMapReady() {
  return mapReady;
}

export function getMapInitError() {
  return mapInitError;
}

export function initMapService() {
  if (mapReady) return;
  mapInitError = null;
  const mapPath = path.join(root, 'data', 'map-data.json');
  if (!fs.existsSync(mapPath)) {
    const legacy = path.join(root, 'public', 'map-data.json');
    if (!fs.existsSync(legacy)) {
      throw new Error('Falta map-data.json. Executa: npm run build:map');
    }
    mapData = JSON.parse(fs.readFileSync(legacy, 'utf8'));
  } else {
    mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  }

  console.log('Servidor: cargando mapa…');
  streetWalker = buildStreetWalker(mapData.streets);
  streetGraph = buildStreetGraph(mapData.streets);

  const spawn = resolveSpawnPoint(mapData, streetWalker);
  const npcs = spawnNpcs(mapData, {
    fontinasBandits: FONTINAS_BANDIT_COUNT,
    generalCount: BATTLE_NPC_COUNT - FONTINAS_BANDIT_COUNT,
  });
  const pickups = spawnWorldPickups(mapData, PICKUP_COUNT);
  const dogs = spawnDogs(mapData, 8);
  wanderPoints = [
    ...buildWanderPointsNearSpawn(mapData, mapData.streets, spawn, 90, 2200),
    ...buildWanderPoints(mapData, mapData.streets, 280),
  ];
  const walkBots = spawnWalkBots(
    mapData,
    WALK_BOT_COUNT,
    streetGraph,
    streetWalker,
    wanderPoints,
    spawn
  );

  world = { spawn, npcs, pickups, dogs, walkBots, wanderPoints };

  console.log(
    `Servidor: ${mapData.streets.length} rúas · ${npcs.length} NPC · ${walkBots.length} cidadáns · grafo listo`
  );
  mapReady = true;
}

/** Carga o mapa en segundo plano (Render abre o porto antes). */
export function startMapServiceAsync() {
  if (mapReady) return Promise.resolve();
  if (mapInitError) return Promise.reject(mapInitError);
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        initMapService();
        resolve();
      } catch (err) {
        mapInitError = err;
        console.error('Servidor: erro ao cargar mapa', err);
        reject(err);
      }
    });
  });
}

export function streetsInRadius(streets, x, y, radiusPx) {
  const r2 = radiusPx * radiusPx * 1.12;
  const out = [];
  for (const street of streets) {
    const pts = street.points;
    if (!pts || pts.length < 2) continue;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - x;
      const dy = pts[i].y - y;
      if (dx * dx + dy * dy <= r2) {
        out.push(street);
        break;
      }
    }
  }
  return out;
}

/** Envía rúas completas (conexión continua); sólo campos necesarios no cliente */
function streetsForClient(streets) {
  return streets.map((s) => ({
    id: s.id,
    name: s.name,
    highway: s.highway,
    points: s.points,
  }));
}

export function respawnOverworldNpc(options) {
  if (!mapData) throw new Error('Mapa non inicializado');
  return respawnNpcAtLevel(mapData, options);
}

export function getBootstrap() {
  if (!world) throw new Error('Mapa non inicializado');
  const { spawn } = world;
  const initialStreets = streetsForClient(
    streetsInRadius(mapData.streets, spawn.x, spawn.y, BOOTSTRAP_RADIUS)
  );

  return {
    version: MAP_SAVE_VERSION,
    bounds: mapData.bounds,
    width: mapData.width,
    height: mapData.height,
    meta: mapData.meta,
    spawn,
    npcs: world.npcs,
    pickups: world.pickups,
    dogs: world.dogs,
    walkBots: compactWalkBots(world.walkBots),
    wanderPoints: world.wanderPoints,
    initialStreets,
  };
}

export function getStreetsChunk(x, y, radiusPx = CHUNK_RADIUS_DEFAULT) {
  const list = streetsForClient(
    streetsInRadius(mapData.streets, x, y, radiusPx)
  );
  return { streets: list, count: list.length };
}

export function getMinimapStreets(x, y, radiusPx) {
  const list = streetsInRadius(mapData.streets, x, y, radiusPx);
  if (list.length <= MINIMAP_MAX_STREETS) return list;
  return list.slice(0, MINIMAP_MAX_STREETS);
}

export function findPath(fromX, fromY, toX, toY) {
  const dest = streetWalker.snapToStreet(toX, toY);
  if (!streetWalker.isWalkable(dest.x, dest.y)) {
    return { ok: false, error: 'Clic sobre unha rúa do mapa' };
  }

  const from = streetWalker.snapToStreet(fromX, fromY);
  const path = streetGraph.findPath(from.x, from.y, dest.x, dest.y);

  if (!path || path.length < 2) {
    return { ok: false, error: 'Non hai ruta pola rúa ata aí' };
  }

  return { ok: true, path, destination: dest };
}

export function getMapMeta() {
  return {
    bounds: mapData.bounds,
    width: mapData.width,
    height: mapData.height,
  };
}
