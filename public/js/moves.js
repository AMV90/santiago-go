/** Base de datos de movementos — estilo Pokémon, temática urbana/conflictiva */
export const MOVES = {
  punetazo: {
    id: 'punetazo',
    name: 'Puñetazo',
    power: 40,
    pp: 35,
    accuracy: 0.95,
    desc: 'Un golpe directo. Nada elegante.',
  },
  empujon: {
    id: 'empujon',
    name: 'Empujón',
    power: 48,
    pp: 30,
    accuracy: 0.9,
    desc: 'Empuja ao rival. Pode fallar se está lonxe.',
  },
  grito: {
    id: 'grito',
    name: 'Grito de guerra',
    power: 0,
    pp: 20,
    accuracy: 1,
    desc: 'Berra tan forte que baja a defensa rival.',
    effect: 'lowerDefense',
  },
  patada: {
    id: 'patada',
    name: 'Patada',
    power: 60,
    pp: 25,
    accuracy: 0.85,
    desc: 'Patada rápida nas canelas.',
  },
  cabezazo: {
    id: 'cabezazo',
    name: 'Cabezazo',
    power: 70,
    pp: 15,
    accuracy: 0.8,
    desc: 'Impacto frontal. Duele aos dous.',
  },
  insulto: {
    id: 'insulto',
    name: 'Insulto veloz',
    power: 55,
    pp: 20,
    accuracy: 0.95,
    desc: 'Provoca antes de que reaccionen.',
  },
  golpe_bajo: {
    id: 'golpe_bajo',
    name: 'Golpe baixo',
    power: 85,
    pp: 10,
    accuracy: 0.7,
    desc: 'Non é xogo limpo, pero funciona.',
  },
};

/** Movementos que aprendes ao subir de nivel */
export const LEVEL_LEARNSET = [
  { level: 1, move: 'punetazo' },
  { level: 3, move: 'empujon' },
  { level: 5, move: 'grito' },
  { level: 7, move: 'patada' },
  { level: 10, move: 'cabezazo' },
  { level: 12, move: 'insulto' },
  { level: 15, move: 'golpe_bajo' },
];

export const MAX_MOVES = 4;

export function movesForLevel(level) {
  const ids = LEVEL_LEARNSET.filter((e) => e.level <= level).map((e) => e.move);
  return ids.slice(-MAX_MOVES);
}

export function movesLearnedAtLevel(level) {
  return LEVEL_LEARNSET.filter((e) => e.level === level).map((e) => e.move);
}
