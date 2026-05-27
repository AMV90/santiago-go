import { lonLatFromGame, isFontinas } from './zones.js';

const NPC_NAMES = [
  'Peregrino borde',
  'Turista insoportable',
  'Veciño cabreado',
  'Hosteleiro conflictivo',
  'Rival do Franco',
  'Tiparraco da Quintana',
  'Becario agresivo',
  'Vendedor ambulante duro',
  'Guía turístico chulo',
  'Músico callejero malhumorado',
  'Veciño da Rúa',
  'Pensionista rabioso',
  'Estudiante borde',
];

const BANDIT_NAMES = [
  'Bandido de Fontiñas',
  'Matón das Fontiñas',
  'Rufián do barrio',
  'Merodeador',
  'Ladroón de rúa',
  'Cabo da banda',
];

const NPC_TITLES = [
  'busca bronca',
  'non perdoa un insulto',
  'vive para discutir',
  'ex-peleador de bar',
  'fan de liarse',
];

const BANDIT_TITLES = ['bandido', 'controla Fontiñas', 'nv. alto', 'non negocia'];

function pickPoint(street) {
  const idx = 1 + Math.floor(Math.random() * (street.points.length - 2));
  return street.points[Math.max(1, Math.min(idx, street.points.length - 2))];
}

function pickName(faction, salt = 0) {
  const pool = faction === 'fontinas' ? BANDIT_NAMES : NPC_NAMES;
  return pool[(salt + Math.floor(Math.random() * 997)) % pool.length];
}

function pickTitle(faction, level, salt = 0) {
  const pool = faction === 'fontinas' ? BANDIT_TITLES : NPC_TITLES;
  const base = pool[(salt + level) % pool.length];
  return `${base} · nv. ${level}`;
}

function makeNpcRecord({
  id,
  name,
  title,
  level,
  x,
  y,
  street,
  faction,
  spriteIndex,
}) {
  return {
    id,
    name,
    title,
    level,
    x,
    y,
    street: street || 'rúa',
    defeated: false,
    sprite: `npc-${spriteIndex % 6}`,
    faction: faction === 'fontinas' ? 'fontinas' : 'urban',
  };
}

/**
 * Sustitúe un rival derrotado por outro do mesmo nivel noutro punto do mapa.
 */
export function respawnNpcAtLevel(mapData, options = {}) {
  const {
    level,
    faction = 'urban',
    awayFromX = 0,
    awayFromY = 0,
    minDist = 900,
    usedCells = new Set(),
    maxAttempts = 200,
  } = options;

  const zoneFilter =
    faction === 'fontinas'
      ? isFontinas
      : (lon, lat) => !isFontinas(lon, lat);

  const streets = mapData.streets.filter(
    (s) => s.points?.length >= 3 && s.highway !== 'steps'
  );
  if (!streets.length) return null;

  const minDist2 = minDist * minDist;
  const idPrefix = faction === 'fontinas' ? 'bandit' : 'npc';
  const salt = Date.now() + Math.floor(Math.random() * 1e6);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const street = streets[Math.floor(Math.random() * streets.length)];
    const p = pickPoint(street);
    const { lon, lat } = lonLatFromGame(p.x, p.y, mapData);
    if (!zoneFilter(lon, lat)) continue;

    const dx = p.x - awayFromX;
    const dy = p.y - awayFromY;
    if (dx * dx + dy * dy < minDist2) continue;

    const cell = `${Math.floor(p.x / 55)},${Math.floor(p.y / 55)}`;
    if (usedCells.has(cell)) continue;
    usedCells.add(cell);

    return makeNpcRecord({
      id: `${idPrefix}-r${salt}-${attempt}`,
      name: pickName(faction, salt + attempt),
      title: pickTitle(faction, level, attempt),
      level,
      x: p.x,
      y: p.y,
      street: street.name || 'rúa',
      faction,
      spriteIndex: salt + attempt,
    });
  }

  return null;
}

function collectUsedCells(npcs) {
  const used = new Set();
  for (const n of npcs) {
    if (n.defeated) continue;
    used.add(`${Math.floor(n.x / 55)},${Math.floor(n.y / 55)}`);
  }
  return used;
}

/** Tras recargar: un substituto por cada rival marcado como derrotado. */
export function replaceDefeatedNpcs(mapData, npcs, defeatedIds = []) {
  if (!defeatedIds?.length) return npcs;

  const active = npcs.filter((n) => !defeatedIds.includes(n.id));
  const usedCells = collectUsedCells(active);
  const replacements = [];

  for (const old of npcs) {
    if (!defeatedIds.includes(old.id)) continue;
    const rep = respawnNpcAtLevel(mapData, {
      level: old.level,
      faction: old.faction || 'urban',
      awayFromX: old.x,
      awayFromY: old.y,
      usedCells,
    });
    if (rep) replacements.push(rep);
  }

  return [...active, ...replacements];
}

function spawnInZone(mapData, zoneFilter, count, levelRange, namePool, titlePool, idPrefix, usedCells) {
  const streets = mapData.streets.filter(
    (s) => s.points.length >= 3 && s.highway !== 'steps'
  );
  const npcs = [];
  let attempts = 0;

  while (npcs.length < count && attempts < count * 60) {
    attempts++;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const p = pickPoint(street);
    const { lon, lat } = lonLatFromGame(p.x, p.y, mapData);
    if (!zoneFilter(lon, lat)) continue;

    const cell = `${Math.floor(p.x / 55)},${Math.floor(p.y / 55)}`;
    if (usedCells.has(cell)) continue;
    usedCells.add(cell);

    const [minLv, maxLv] = levelRange;
    const level = minLv + Math.floor(Math.random() * (maxLv - minLv + 1));
    const i = npcs.length;

    npcs.push(
      makeNpcRecord({
        id: `${idPrefix}-${i}`,
        name:
          namePool[i % namePool.length] + (count > namePool.length ? ` ${i + 1}` : ''),
        title: titlePool[i % titlePool.length],
        level,
        x: p.x,
        y: p.y,
        street: street.name || 'rúa',
        faction: idPrefix === 'bandit' ? 'fontinas' : 'urban',
        spriteIndex: i,
      })
    );
  }
  return npcs;
}

export function spawnNpcs(mapData, options = {}) {
  const {
    fontinasBandits = 22,
    generalCount = 100,
  } = options;

  const usedCells = new Set();

  const bandits = spawnInZone(
    mapData,
    isFontinas,
    fontinasBandits,
    [5, 6],
    BANDIT_NAMES,
    BANDIT_TITLES,
    'bandit',
    usedCells
  );

  const general = spawnInZone(
    mapData,
    (lon, lat) => !isFontinas(lon, lat),
    generalCount,
    [1, 4],
    NPC_NAMES,
    NPC_TITLES,
    'npc',
    usedCells
  );

  return [...bandits, ...general];
}

export function createEnemyFromNpc(npc) {
  const movePool = ['punetazo', 'empujon', 'patada', 'grito', 'insulto', 'cabezazo', 'golpe_bajo'];
  const count = Math.min(4, 1 + Math.floor(npc.level / 3));
  const moves = [];
  for (let i = 0; i < count; i++) {
    const m = movePool[Math.min(i + Math.floor(npc.level / 4), movePool.length - 1)];
    if (!moves.includes(m)) moves.push(m);
  }
  if (!moves.includes('punetazo')) moves.unshift('punetazo');

  return {
    name: npc.name,
    title: npc.title,
    level: npc.level,
    hp: 16 + npc.level * 7,
    maxHp: 16 + npc.level * 7,
    moves: moves.slice(0, 4),
    sprite: npc.sprite,
    faction: npc.faction,
  };
}
