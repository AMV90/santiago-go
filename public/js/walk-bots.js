import {
  WALK_BOT_COUNT,
  WALK_BOTS_NEAR_SPAWN,
  WALK_BOT_NEAR_RADIUS,
  WALK_BOT_SPEED_MIN,
  WALK_BOT_SPEED_MAX,
  CITIZEN_TALK_RANGE,
} from './config.js';
import { lonLatFromGame, isOldTown } from './zones.js';
import { getPersonalityForBotIndex, randomPhrase } from './citizen-personalities.js';
import { showChatBubble } from './chat-bubbles.js';
import { fetchPath } from './game-api.js';

const WANDER_POINT_COUNT = 300;
const ROUTE_MIN_DIST = 700;
const ROUTE_MAX_DIST = 14000;

/**
 * Puntos de ruta densos preto do spawn (centro / catedral).
 */
export function buildWanderPointsNearSpawn(
  mapData,
  streets,
  spawn,
  count = 80,
  radiusPx = WALK_BOT_NEAR_RADIUS
) {
  if (!spawn) return [];
  const valid = streets.filter((s) => s.points?.length >= 2);
  if (!valid.length) return [];

  const points = [];
  const seen = new Set();
  const r2 = radiusPx * radiusPx;

  for (let n = 0; n < count * 12 && points.length < count; n++) {
    const st = valid[Math.floor(Math.random() * valid.length)];
    const p = st.points[Math.floor(Math.random() * st.points.length)];
    const dx = p.x - spawn.x;
    const dy = p.y - spawn.y;
    if (dx * dx + dy * dy > r2) continue;

    const key = `${Math.round(p.x / 120)},${Math.round(p.y / 120)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    points.push({ x: p.x, y: p.y });
  }

  return points;
}

/**
 * Puntos aleatorios repartidos polo mapa (destinos de ruta).
 */
export function buildWanderPoints(mapData, streets, count = WANDER_POINT_COUNT) {
  const valid = streets.filter((s) => s.points?.length >= 2);
  if (!valid.length) return [];

  const points = [];
  const seen = new Set();

  for (let n = 0; n < count * 8 && points.length < count; n++) {
    const st = valid[Math.floor(Math.random() * valid.length)];
    const pts = st.points;
    const p = pts[Math.floor(Math.random() * pts.length)];
    const key = `${Math.round(p.x / 180)},${Math.round(p.y / 180)}`;
    if (seen.has(key)) continue;

    const { lon, lat } = lonLatFromGame(p.x, p.y, mapData);
    if (isOldTown(lon, lat) && Math.random() < 0.55) continue;

    seen.add(key);
    points.push({ x: p.x, y: p.y });
  }

  return points;
}

export function pickRandomDestination(fromX, fromY, wanderPoints, minDist = ROUTE_MIN_DIST) {
  if (!wanderPoints?.length) return null;

  let pool = wanderPoints.filter((p) => {
    const d = Math.hypot(p.x - fromX, p.y - fromY);
    return d >= minDist && d <= ROUTE_MAX_DIST;
  });

  if (!pool.length) {
    pool = wanderPoints.filter((p) => Math.hypot(p.x - fromX, p.y - fromY) >= minDist * 0.4);
  }
  if (!pool.length) pool = wanderPoints;

  return pool[Math.floor(Math.random() * pool.length)];
}

function planRoute(streetGraph, streetWalker, fromX, fromY, toX, toY) {
  if (!streetGraph?.findPath || !streetWalker) return null;
  const from = streetWalker.snapToStreet(fromX, fromY);
  const to = streetWalker.snapToStreet(toX, toY);
  if (!streetWalker.isWalkable(to.x, to.y)) return null;
  return streetGraph.findPath(from.x, from.y, to.x, to.y);
}

function createBotWithRoute(
  index,
  personality,
  streetGraph,
  streetWalker,
  wanderPoints,
  spawnBias = null
) {
  const speed =
    WALK_BOT_SPEED_MIN + Math.random() * (WALK_BOT_SPEED_MAX - WALK_BOT_SPEED_MIN);

  const spawnPool = spawnBias
    ? wanderPoints.filter((p) => {
        const d = Math.hypot(p.x - spawnBias.x, p.y - spawnBias.y);
        return d <= spawnBias.radius;
      })
    : null;
  const pickSpawnFrom = spawnPool?.length >= 6 ? spawnPool : wanderPoints;

  for (let attempt = 0; attempt < 48; attempt++) {
    const spawnPt = pickSpawnFrom[Math.floor(Math.random() * pickSpawnFrom.length)];
    const destPt = pickRandomDestination(spawnPt.x, spawnPt.y, wanderPoints);
    if (!destPt) continue;

    const path = planRoute(
      streetGraph,
      streetWalker,
      spawnPt.x,
      spawnPt.y,
      destPt.x,
      destPt.y
    );
    if (!path || path.length < 2) continue;

    return {
      id: `walk-bot-${index}`,
      personalityId: personality.id,
      personalityLabel: personality.label,
      phrases: personality.phrases,
      lastPhrase: '',
      x: path[0].x,
      y: path[0].y,
      route: path,
      routeIdx: 0,
      segT: Math.random() * 0.25,
      speed,
      sprite: `bot-${index % 104}`,
      pauseMs: Math.random() * 800,
      phraseCooldown: 0,
    };
  }

  const fallback = pickSpawnFrom[index % pickSpawnFrom.length] || wanderPoints[0] || { x: 0, y: 0 };
  return {
    id: `walk-bot-${index}`,
    personalityId: personality.id,
    personalityLabel: personality.label,
    phrases: personality.phrases,
    lastPhrase: '',
    x: fallback.x,
    y: fallback.y,
    route: [fallback, { x: fallback.x + 40, y: fallback.y }],
    routeIdx: 0,
    segT: 0,
    speed,
    sprite: `bot-${index % 4}`,
    pauseMs: 500,
    phraseCooldown: 0,
  };
}

/**
 * Cidadáns (bots verdes): rutas aleatorias polo grafo de rúas.
 */
export function spawnWalkBots(
  mapData,
  count = WALK_BOT_COUNT,
  streetGraph = null,
  streetWalker = null,
  wanderPoints = null,
  spawn = null
) {
  const streets = mapData.streets.filter((s) => s.points?.length >= 3);
  if (!streets.length) return [];

  const points = wanderPoints?.length
    ? wanderPoints
    : buildWanderPoints(mapData, streets, WANDER_POINT_COUNT);
  if (!points.length) return [];

  const bots = [];
  const nearCount = spawn ? Math.min(WALK_BOTS_NEAR_SPAWN, count) : 0;
  const spawnBias = spawn
    ? { x: spawn.x, y: spawn.y, radius: WALK_BOT_NEAR_RADIUS }
    : null;

  for (let i = 0; i < count; i++) {
    const personality = getPersonalityForBotIndex(i);
    const bias = i < nearCount ? spawnBias : null;
    bots.push(createBotWithRoute(i, personality, streetGraph, streetWalker, points, bias));
  }

  return bots;
}

/** Para o bootstrap: só posición e meta, sen polilíneas enormes */
export function compactWalkBots(bots) {
  return bots.map(({ route, ...bot }) => bot);
}

export function createWalkBotSprites(scene, bots = []) {
  if (!Array.isArray(bots) || !bots.length) return [];
  return bots.map((bot, i) => {
    const spr = scene.add.sprite(bot.x ?? 0, bot.y ?? 0, 'char-bot');
    if (scene.applyBotSprite) scene.applyBotSprite(spr, i);
    else spr.setTexture(bot.sprite);
    spr.setDepth(10);
    spr.setData('bot', bot);
    spr.setData('citizen', true);
    return spr;
  });
}

export function countCitizensNear(scene, radius = 900) {
  if (!scene.player || !scene.walkBotSprites?.length) return 0;
  let n = 0;
  for (const spr of scene.walkBotSprites) {
    if (!spr.visible || !spr.active) continue;
    if (
      Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spr.x, spr.y) <= radius
    ) {
      n += 1;
    }
  }
  return n;
}

async function requestBotRoute(scene, bot, spr, botIndex = 0) {
  if (bot._fetchingRoute) return;
  const wanderPoints = scene.wanderPoints;
  if (!wanderPoints?.length) {
    bot.pauseMs = 2500;
    return;
  }

  const now = performance.now();
  if (!bot._nextRouteAt) {
    bot._nextRouteAt = now + botIndex * 90 + Math.random() * 500;
  }
  if (now < bot._nextRouteAt) {
    bot.pauseMs = Math.max(bot.pauseMs, bot._nextRouteAt - now);
    return;
  }

  const dest = pickRandomDestination(spr.x, spr.y, wanderPoints);
  if (!dest) {
    bot.pauseMs = 2000;
    return;
  }

  bot._fetchingRoute = true;
  try {
    const result = await fetchPath(spr.x, spr.y, dest.x, dest.y);
    if (result.path?.length >= 2) {
      bot.route = result.path;
      bot.routeIdx = 0;
      bot.segT = 0;
      bot.x = result.path[0].x;
      bot.y = result.path[0].y;
      bot._nextRouteAt = 0;
    } else {
      bot.pauseMs = 1500 + Math.random() * 2000;
      bot._nextRouteAt = now + 3000 + Math.random() * 2000;
    }
  } catch {
    bot.pauseMs = 3000 + Math.random() * 2000;
    bot._nextRouteAt = now + 4000 + Math.random() * 2000;
  } finally {
    bot._fetchingRoute = false;
  }
}

export function updateWalkBots(scene, bots, sprites, delta) {
  const dt = delta;

  for (let i = 0; i < bots.length; i++) {
    const bot = bots[i];
    const spr = sprites[i];
    if (!spr?.active) continue;

    if (bot.pauseMs > 0) {
      bot.pauseMs -= dt;
      continue;
    }

    const route = bot.route;
    if (!route || route.length < 2) {
      requestBotRoute(scene, bot, spr, i);
      continue;
    }

    let idx = bot.routeIdx ?? 0;
    if (idx >= route.length - 1) {
      spr.x = route[route.length - 1].x;
      spr.y = route[route.length - 1].y;
      bot.x = spr.x;
      bot.y = spr.y;
      bot.route = null;
      bot.pauseMs = 600 + Math.random() * 1400;
      requestBotRoute(scene, bot, spr, i);
      continue;
    }

    let a = route[idx];
    let b = route[idx + 1];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const step = ((bot.speed * dt) / 1000) / segLen;
    bot.segT = (bot.segT ?? 0) + step;

    while (bot.segT >= 1 && idx < route.length - 1) {
      bot.segT -= 1;
      idx += 1;
      if (idx >= route.length - 1) break;
      a = route[idx];
      b = route[idx + 1];
    }

    bot.routeIdx = idx;

    if (idx >= route.length - 1) {
      spr.x = route[route.length - 1].x;
      spr.y = route[route.length - 1].y;
      bot.x = spr.x;
      bot.y = spr.y;
      bot.route = null;
      bot.pauseMs = 500 + Math.random() * 1200;
      requestBotRoute(scene, bot, spr, i);
      continue;
    }

    const nx = a.x + (b.x - a.x) * bot.segT;
    const ny = a.y + (b.y - a.y) * bot.segT;
    if (scene.updateBotWalkAnim) scene.updateBotWalkAnim(spr, nx - spr.x, ny - spr.y);
    spr.x = nx;
    spr.y = ny;
    bot.x = nx;
    bot.y = ny;
  }
}

/** Espazo: falar co cidadán máis próximo */
export function tryCitizenInteraction(scene) {
  if (!scene.player || !scene.walkBotSprites?.length) return false;

  const now = scene.time?.now ?? performance.now();
  if (scene._citizenTalkLock && now < scene._citizenTalkLock) return false;

  let best = null;
  let bestD = CITIZEN_TALK_RANGE;

  for (const spr of scene.walkBotSprites) {
    const bot = spr.getData('bot');
    if (!bot) continue;
    const d = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spr.x, spr.y);
    if (d < bestD) {
      bestD = d;
      best = { spr, bot };
    }
  }

  if (!best) return false;

  const { bot, spr } = best;
  let phrase = randomPhrase({
    id: bot.personalityId,
    phrases: bot.phrases || [],
  });

  if (phrase === bot.lastPhrase && bot.phrases?.length > 1) {
    const alt = bot.phrases.filter((p) => p !== phrase);
    phrase = alt[Math.floor(Math.random() * alt.length)] || phrase;
  }
  bot.lastPhrase = phrase;

  showChatBubble(scene, `citizen-${bot.id}`, phrase, spr.x, spr.y, {
    backgroundColor: '#d4f0d4',
    color: '#1a3d1a',
  });

  scene._citizenTalkLock = now + 1800;
  bot.pauseMs = 1400 + Math.random() * 600;
  return true;
}
