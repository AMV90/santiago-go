import { movesForLevel, movesLearnedAtLevel, MOVES, MAX_MOVES } from './moves.js';
import { ensureInventory } from './inventory.js';

const SAVE_KEY = 'santiago-go-player';

export function createDefaultPlayer() {
  const level = 1;
  const p = {
    name: 'Ti',
    title: 'Persoa conflictiva',
    level,
    xp: 0,
    hp: maxHpForLevel(level),
    maxHp: maxHpForLevel(level),
    moves: movesForLevel(level).map(createMoveSlot),
    stats: { wins: 0, defeats: 0 },
    inventory: {},
    dog: { captured: false, companionName: 'Champú', affection: {} },
  };
  return normalizePlayer(p);
}

function normalizePlayer(p) {
  ensureInventory(p);
  return p;
}

function createMoveSlot(moveId) {
  const m = MOVES[moveId];
  return { id: moveId, pp: m.pp, maxPp: m.pp };
}

export function maxHpForLevel(level) {
  return 22 + (level - 1) * 8;
}

export function xpToNextLevel(level) {
  return level * 100;
}

export function loadPlayer(forceFresh = false) {
  if (forceFresh) return createDefaultPlayer();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultPlayer();
    const p = JSON.parse(raw);
    const merged = normalizePlayer({ ...createDefaultPlayer(), ...p });
    for (const slot of merged.moves) {
      const def = MOVES[slot.id];
      if (def) {
        slot.maxPp = slot.maxPp ?? def.pp;
        slot.pp = Math.min(slot.pp ?? def.pp, slot.maxPp);
      }
    }
    return merged;
  } catch {
    return createDefaultPlayer();
  }
}

export function savePlayer(player) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

export function healPlayer(player) {
  player.hp = player.maxHp;
  for (const slot of player.moves) {
    slot.pp = slot.maxPp;
  }
}

export function gainXp(player, amount) {
  const messages = [];
  player.xp += amount;
  messages.push(`+${amount} XP`);

  while (player.xp >= xpToNextLevel(player.level)) {
    player.xp -= xpToNextLevel(player.level);
    player.level += 1;
    player.maxHp = maxHpForLevel(player.level);
    player.hp = player.maxHp;
    messages.push(`Subiches ao nivel ${player.level}!`);

    const newMoves = movesLearnedAtLevel(player.level);
    for (const moveId of newMoves) {
      const learned = learnMove(player, moveId);
      if (learned) messages.push(`Aprendiches ${MOVES[moveId].name}!`);
    }
    syncMovesForLevel(player);
  }
  savePlayer(player);
  return messages;
}

function syncMovesForLevel(player) {
  const ids = movesForLevel(player.level);
  const current = player.moves.map((m) => m.id);
  for (const id of ids) {
    if (!current.includes(id)) learnMove(player, id);
  }
  while (player.moves.length > MAX_MOVES) player.moves.shift();
}

function learnMove(player, moveId) {
  if (player.moves.some((m) => m.id === moveId)) return false;
  if (player.moves.length < MAX_MOVES) {
    player.moves.push(createMoveSlot(moveId));
    return true;
  }
  player.moves[player.moves.length - 1] = createMoveSlot(moveId);
  return true;
}

export function resetPlayer() {
  const p = createDefaultPlayer();
  savePlayer(p);
  return p;
}

/** Morir en combate: nivel 1, XP 0, movementos iniciais, rivais reaparecen */
export function resetOnDeath() {
  localStorage.removeItem('santiago-go-defeated');
  localStorage.removeItem('santiago-go-collected');
  return resetPlayer();
}

export function xpProgress(player) {
  const need = xpToNextLevel(player.level);
  return { current: player.xp, need, pct: Math.min(100, Math.round((player.xp / need) * 100)) };
}
