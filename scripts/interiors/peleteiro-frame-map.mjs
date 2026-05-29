/** Mapa ASCII → índice de frame (sincronizado con peleteiro-tile-render.js). */

export const TILE = 16;
export const COLS = 8;

export const FRAMES = {
  WALL_OUT: 0,
  WALL_IN: 1,
  ASPHALT_A: 2,
  ASPHALT_B: 3,
  SIDEWALK: 4,
  BUILDING: 5,
  BUILDING_WIN: 6,
  FLOOR: 7,
  FLOOR_ALT: 8,
  FIRE: 9,
  LOCKER: 10,
  STAIR_UP_0: 11,
  STAIR_UP_1: 12,
  STAIR_UP_2: 13,
  STAIR_UP_3: 14,
  STAIR_DOWN_0: 15,
  STAIR_DOWN_1: 16,
  STAIR_DOWN_2: 17,
  STAIR_DOWN_3: 18,
  DOOR: 19,
  CASITA: 20,
  PALM_POT: 21,
  PALM_TRUNK: 22,
  PALM_LEAF: 23,
  CARPET_A: 24,
  CARPET_B: 25,
  CHAIR: 26,
  DESK: 27,
  TEACHER_DESK: 28,
  BOOKSHELF: 29,
  DISPLAY: 30,
  BLACKBOARD: 31,
  BENCH: 32,
  COMPUTER: 33,
  PLANT_INDOOR: 34,
  LIBRARY_CARPET: 35,
  CRYPT_FLOOR: 36,
  CRYPT_FOG: 37,
  SKELETON_PROP: 38,
  WISP: 39,
};

function isPatioMap(rows) {
  for (const row of rows) {
    if (row.includes('a') || row.includes('B')) return true;
  }
  return false;
}

function stairStepIndex(rows, tx, ty, ch) {
  let step = 0;
  let y = ty;
  while (y > 0 && rows[y - 1]?.[tx] === ch) {
    step++;
    y--;
  }
  return Math.min(3, step);
}

export function resolvePeleteiroFrame(ch, tx, ty, rows) {
  const patio = isPatioMap(rows);
  switch (ch) {
    case '#':
      return patio ? FRAMES.WALL_OUT : FRAMES.WALL_IN;
    case 'a':
      return (tx + ty) & 1 ? FRAMES.ASPHALT_B : FRAMES.ASPHALT_A;
    case 's':
      return FRAMES.SIDEWALK;
    case 'B':
      return (tx * 3 + ty) % 5 === 0 ? FRAMES.BUILDING_WIN : FRAMES.BUILDING;
    case 'h':
      return FRAMES.WALL_IN;
    case 'x':
      return FRAMES.WALL_IN;
    case '.':
      return (tx + ty) & 1 ? FRAMES.FLOOR_ALT : FRAMES.FLOOR;
    case 'F':
      return FRAMES.FIRE;
    case 'L':
      return FRAMES.LOCKER;
    case 'u': {
      const step = stairStepIndex(rows, tx, ty, 'u');
      return FRAMES.STAIR_UP_0 + step;
    }
    case 'v': {
      const step = stairStepIndex(rows, tx, ty, 'v');
      return FRAMES.STAIR_DOWN_0 + step;
    }
    case 'D':
      return FRAMES.DOOR;
    case 'C':
      return FRAMES.CASITA;
    case 'm':
      return FRAMES.PALM_POT;
    case 't':
      return FRAMES.PALM_TRUNK;
    case 'P':
      return FRAMES.PALM_LEAF;
    case 'r':
      return FRAMES.CARPET_A;
    case 'R':
      return FRAMES.CARPET_B;
    case 'c':
      return FRAMES.CHAIR;
    case 'd':
      return FRAMES.DESK;
    case 'M':
      return FRAMES.TEACHER_DESK;
    case 'b':
      return FRAMES.BOOKSHELF;
    case 'e':
      return FRAMES.DISPLAY;
    case 'p':
      return FRAMES.BLACKBOARD;
    case 'n':
      return FRAMES.BENCH;
    case 'o':
      return FRAMES.COMPUTER;
    case 'i':
      return FRAMES.PLANT_INDOOR;
    case 'Y':
      return FRAMES.LIBRARY_CARPET;
    case 'K':
      return FRAMES.CRYPT_FLOOR;
    case 'G':
      return FRAMES.CRYPT_FOG;
    case 'S':
      return FRAMES.SKELETON_PROP;
    case 'W':
      return FRAMES.WISP;
    default:
      return patio ? FRAMES.ASPHALT_A : FRAMES.FLOOR;
  }
}

/** Suelo bajo un prop (para la capa base sin muebles). */
export function underlayCharForProp(ch, tx, ty, rows) {
  const patio = isPatioMap(rows);
  if (ch === 'Y') return 'Y';
  if (ch === 'K' || ch === 'S') return 'K';
  if (ch === 'G' || ch === 'W') return 'G';
  if (patio) return (tx + ty) & 1 ? 's' : 'a';
  return (tx + ty) & 1 ? 'R' : 'r';
}
