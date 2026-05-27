import { THROW_ITEMS } from './items.js';
import { removeItem, ensureInventory } from './inventory.js';

export const BONES_TO_CAPTURE = 3;

export function spawnDogs(mapData, count = 6) {
  const streets = mapData.streets.filter((s) => s.name && s.points.length >= 4);
  const dogs = [];
  const used = new Set();

  let attempts = 0;
  while (dogs.length < count && attempts < count * 25) {
    attempts++;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const idx = Math.floor(Math.random() * street.points.length);
    const p = street.points[idx];
    const cell = `${Math.floor(p.x / 120)},${Math.floor(p.y / 120)}`;
    if (used.has(cell)) continue;
    used.add(cell);

    dogs.push({
      id: `dog-${dogs.length}`,
      name: ['Rex', 'Tufo', 'Lobo', 'Negro', 'Canela', 'Pirata'][dogs.length % 6],
      x: p.x,
      y: p.y,
      street: street.name,
    });
  }
  return dogs;
}

export function createDogSprites(scene, dogs, player) {
  ensureInventory(player);
  return dogs.map((dog) => {
    const captured = player.dog.captured && player.dog.companionId === dog.id;
    const spr = scene.add.sprite(dog.x, dog.y, captured ? 'dog-companion' : 'dog-wild');
    spr.setScale(1.1);
    spr.setDepth(9);
    spr.setData('dog', dog);
    if (captured) spr.setTint(0xffd93d);
    return spr;
  });
}

/** Lanzar óso ao can no mapa */
export function throwBoneAtDog(player, dog) {
  ensureInventory(player);
  if (player.dog.captured) {
    return { ok: false, msg: 'Xa tes un can contigo.' };
  }
  if ((player.inventory.hueso || 0) < 1) {
    return { ok: false, msg: 'Non tes ósos. Búscaos polo mapa.' };
  }

  removeItem(player, 'hueso', 1);
  if (!player.dog.affection[dog.id]) player.dog.affection[dog.id] = 0;
  player.dog.affection[dog.id] += 1;
  const bones = player.dog.affection[dog.id];

  if (bones >= BONES_TO_CAPTURE) {
    player.dog.captured = true;
    player.dog.companionId = dog.id;
    player.dog.companionName = dog.name;
    return {
      ok: true,
      captured: true,
      msg: `¡${dog.name} é teu! Axudarache en cada combate despois dos teus golpes.`,
    };
  }

  const left = BONES_TO_CAPTURE - bones;
  return {
    ok: true,
    captured: false,
    msg: `Lanzas un óso a ${dog.name}. Está un pouco máis namorado (${bones}/${BONES_TO_CAPTURE}). Faltan ${left}.`,
  };
}

/** Ataque do can tras o teu turno en combate */
export function dogBattleAttack(player, enemy) {
  if (!player.dog?.captured) return null;
  const power = 28;
  const crit = Math.random() < 0.14;
  let dmg = Math.max(2, Math.floor(power * (0.9 + player.level * 0.08)));
  if (crit) dmg = Math.floor(dmg * 1.7);
  enemy.hp = Math.max(0, enemy.hp - dmg);
  const name = player.dog.companionName || 'O teu can';
  return {
    dmg,
    crit,
    msg: crit
      ? `¡${name} mordelle! Crítico: -${dmg} HP`
      : `${name} ataca: -${dmg} HP`,
  };
}
