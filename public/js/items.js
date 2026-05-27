/** Obxectos de un só uso — dano moderado (non trivializar combates) */
export const THROW_ITEMS = {
  pedra: {
    id: 'pedra',
    name: 'Pedra',
    power: 16,
    critChance: 0.08,
    critMult: 1.45,
    accuracy: 0.9,
    desc: 'Pedra de campo.',
    field: true,
  },
  palo: {
    id: 'palo',
    name: 'Palo',
    power: 20,
    critChance: 0.09,
    critMult: 1.5,
    accuracy: 0.86,
    desc: 'Palo do monte.',
    field: true,
  },
  vaso_roto: {
    id: 'vaso_roto',
    name: 'Vaso roto',
    power: 24,
    critChance: 0.12,
    critMult: 1.55,
    accuracy: 0.82,
    desc: 'Cristal urbano.',
    field: false,
  },
  hueso: {
    id: 'hueso',
    name: 'Óso',
    power: 14,
    critChance: 0.06,
    critMult: 1.4,
    accuracy: 0.92,
    desc: 'Óso. Para o can ou un golpe débil.',
    field: true,
  },
  lata: {
    id: 'lata',
    name: 'Lata amachada',
    power: 18,
    critChance: 0.08,
    critMult: 1.45,
    accuracy: 0.88,
    desc: 'Lata encontrada fóra do centro.',
    field: true,
  },
};

export const FIELD_ITEM_IDS = Object.keys(THROW_ITEMS).filter((id) => THROW_ITEMS[id].field);

export const PICKUP_TYPES = Object.keys(THROW_ITEMS);

export function rollThrowDamage(item, playerLevel, defenseMod = 1) {
  const base = ((2 * playerLevel) / 5 + 2) * item.power;
  const rand = 0.9 + Math.random() * 0.1;
  let dmg = Math.max(1, Math.floor((base / 20) * rand * defenseMod));
  const crit = Math.random() < item.critChance;
  if (crit) dmg = Math.max(1, Math.floor(dmg * item.critMult));
  return { dmg, crit };
}
