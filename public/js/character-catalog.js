/**
 * Catálogo central de personaxes LPC — arquetipos, elección determinista e combate.
 */
import { getLpcManifest, resolveRoleCharacterId } from './lpc-sprites.js';

function getCatalog() {
  const manifest = getLpcManifest();
  return manifest?.archetypes ?? null;
}

function hashSalt(...parts) {
  const s = parts.filter((p) => p != null).join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function expandPrefix(pool) {
  const from = pool.from ?? 0;
  const to = pool.to ?? from;
  const ids = [];
  for (let i = from; i <= to; i++) ids.push(`${pool.prefix}${i}`);
  return ids;
}

function resolvePoolList(poolDef, manifest) {
  if (!poolDef) return [];
  if (Array.isArray(poolDef)) {
    const out = [];
    for (const item of poolDef) {
      if (typeof item === 'string') out.push(item);
      else if (item?.pick) out.push(...resolvePoolList(item.pick, manifest));
      else if (item?.prefix) out.push(...expandPrefix(item));
      else if (item?.role && manifest?.roles?.[item.role]) {
        const role = manifest.roles[item.role];
        out.push(...(Array.isArray(role) ? role : [role]));
      }
    }
    return out;
  }
  if (poolDef.role && manifest?.roles?.[poolDef.role]) {
    const role = manifest.roles[poolDef.role];
    return Array.isArray(role) ? role : [role];
  }
  if (poolDef.prefix) return expandPrefix(poolDef);
  if (poolDef.pick) return resolvePoolList(poolDef.pick, manifest);
  return [];
}

/** Arquetipo canónico (resolves aliases tipo mendigo → beggar). */
export function normalizeArchetype(key) {
  if (!key) return null;
  const catalog = getCatalog();
  return catalog?.aliases?.[key] ?? key;
}

/** Elixe un personaxe do pool do arquetipo (determinista por salt). */
export function pickCharacterId(archetype, salt = 0) {
  const arch = normalizeArchetype(archetype);
  const catalog = getCatalog();
  const manifest = getLpcManifest();
  const pool = resolvePoolList(catalog?.pools?.[arch], manifest);
  const chars = manifest?.characters ?? {};
  const valid = pool.filter((id) => chars[id]);
  const use = valid.length ? valid : pool;
  if (!use.length) return 'npc-0';
  return use[salt % use.length];
}

/** Salt estábel para spawns en instancias (place, planta, índice…). */
export function spawnCharacterSalt(ctx = {}) {
  return hashSalt(
    ctx.placeId,
    ctx.floor,
    ctx.index,
    ctx.tx,
    ctx.ty,
    ctx.levelOff,
    ctx.id
  );
}

export function resolveCharacterId(actor, sprite = null) {
  const fromSprite = sprite?.getData?.('lpcCharacterId');
  if (fromSprite) return fromSprite;

  const fixed = actor?.characterId ?? actor?.lpcId;
  if (fixed) return fixed;

  return assignCharacterId(actor || {});
}

export function resolveActorTint(actor, sprite = null) {
  if (actor?.tint != null) return actor.tint;
  const t = sprite?.tint;
  if (t != null && t !== 0xffffff) return t;
  return undefined;
}

export function assignCharacterId(actor) {
  const fixed = actor?.characterId ?? actor?.lpcId;
  if (fixed) return fixed;

  if (actor.archetype) {
    return pickCharacterId(
      actor.archetype,
      hashSalt(actor.id, actor.tx, actor.ty, actor.level, actor.spriteIndex)
    );
  }

  const catalog = getCatalog();
  const factionArch = catalog?.factionArchetype?.[actor.faction];
  if (factionArch) {
    return pickCharacterId(
      factionArch,
      actor.spriteIndex ?? hashSalt(actor.id, actor.level)
    );
  }

  if (actor.faction === 'clergy' || actor.sprite === 'priest') {
    return pickCharacterId('clergy', 0);
  }

  const legacy = String(actor.sprite || '').match(/npc-(\d+)/);
  const spriteIndex = actor.spriteIndex ?? (legacy ? Number(legacy[1]) : 0);
  const manifest = getLpcManifest();
  const fromRole = resolveRoleCharacterId(manifest, 'npc', spriteIndex);
  if (fromRole) return fromRole;
  if (legacy) return `npc-${Number(legacy[1]) % 120}`;
  return pickCharacterId('urban', hashSalt(actor.id, actor.spriteIndex, actor.name));
}

export function resolveBattleCharacterId(entity, role = 'enemy') {
  if (role === 'player') return 'player';
  if (!entity) return 'npc-0';
  return resolveCharacterId(entity);
}

export function getBattleProfile(profileId = 'street') {
  const profiles = getCatalog()?.battleProfiles;
  return profiles?.[profileId] ?? profiles?.street ?? null;
}

export function syncActorCharacterId(actor, characterId) {
  if (!actor || !characterId) return;
  actor.characterId = characterId;
  actor.lpcId = characterId;
}
