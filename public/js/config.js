import { CATHEDRAL } from './map-bounds.js';
import { project } from './geo.js';

export const MAP_SAVE_VERSION = 'santiago-metro-v9';

/** Referencia lon/lat catedral (fallback) */
export function getCathedralSpawn(mapData) {
  if (mapData?.meta?.spawn) {
    return {
      x: mapData.meta.spawn.x,
      y: mapData.meta.spawn.y,
      label: mapData.meta.spawn.label || CATHEDRAL.label,
    };
  }
  const p = project(CATHEDRAL.lon, CATHEDRAL.lat, mapData.width, mapData.height, mapData.bounds);
  return { x: Math.round(p.x), y: Math.round(p.y), label: CATHEDRAL.label };
}

/** Movemento pegado ao eixe da rúa (sen deriva ampla) */
export const STREET_WALK_RADIUS = 22;
export const STREET_GRID_CELL = 100;
export const PATH_WAYPOINT_RADIUS = 16;
export const NPC_ENCOUNTER_RANGE = 22;

/** Velocidade con aceleración (movement-controller.js) */
export const MOVE_MAX_SPEED = 720;
export const MOVE_ACCEL = 3200;
export const MOVE_DECEL = 4200;
export const MOVE_SUBSTEP_MAX_PX = 10;
export const MOVE_TURN_SNAP = 12;

/** @deprecated Usa MOVE_MAX_SPEED */
export const PLAYER_SPEED = MOVE_MAX_SPEED;

/** Servidor multixogador (mismo host que a web se usas npm run play) */
export const MULTIPLAYER_URL =
  typeof location !== 'undefined' && location.port === '5173'
    ? 'http://localhost:3000'
    : typeof location !== 'undefined'
      ? location.origin
      : 'http://localhost:3000';
export const WALK_BOT_COUNT = 120;
export const WALK_BOTS_NEAR_SPAWN = 28;
export const WALK_BOT_NEAR_RADIUS = 1800;
export const WALK_BOT_SPEED_MIN = 55;
export const WALK_BOT_SPEED_MAX = 85;
/** Distancia para falar con cidadáns (espazo) */
export const CITIZEN_TALK_RANGE = 56;
export const CAMERA_LERP = 0.42;
export const MOVE_SEND_INTERVAL_MS = 80;
export const BATTLE_NPC_COUNT = 122;
export const FONTINAS_BANDIT_COUNT = 22;
export const PICKUP_COUNT = 90;
