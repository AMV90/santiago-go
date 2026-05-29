import { MOVES } from './moves.js';
import {
  getBattleProfile,
  normalizeArchetype,
  resolveActorTint,
  resolveCharacterId,
} from './character-catalog.js';

export function formatLevelBattleTag(npc) {
  return `Nv. ${npc.level ?? 1}`;
}

/**
 * Inimigo de combate xenérico (calle, interiores, eventos).
 * @param {object} npc
 * @param {Phaser.GameObjects.Sprite} [spr]
 */
export function createBattleEnemy(npc, spr = null) {
  const profile = getBattleProfile(npc.battleProfile ?? 'street') ?? {
    hpBase: 16,
    hpPerLevel: 7,
    movePool: ['punetazo', 'empujon', 'patada', 'grito'],
  };

  const level = npc.level || 1;
  const movePool = profile.movePool || ['punetazo', 'grito'];
  const count = Math.min(4, 1 + Math.floor(level / 3));
  const moves = [];
  for (let i = 0; i < count; i++) {
    const m = movePool[Math.min(i + Math.floor(level / 4), movePool.length - 1)];
    if (!moves.includes(m)) moves.push(m);
  }
  if (!moves.includes('punetazo') && MOVES.punetazo) moves.unshift('punetazo');

  const arch = normalizeArchetype(npc.archetype ?? npc.enemyType);
  const tagIcon = profile.tagIcons?.[arch] ?? '⚔️';

  return {
    name: npc.name,
    title: npc.title,
    level,
    hp: profile.hpBase + level * profile.hpPerLevel,
    maxHp: profile.hpBase + level * profile.hpPerLevel,
    moves: moves.filter((id) => MOVES[id]).slice(0, 4),
    sprite: npc.sprite,
    characterId: resolveCharacterId(npc, spr),
    lpcId: resolveCharacterId(npc, spr),
    tint: resolveActorTint(npc, spr),
    faction: npc.faction,
    battleQuote: npc.battleQuote,
    presentationLine: npc.presentationLine,
    _tagIcon: tagIcon,
  };
}
