/**
 * Render de interiores Peleteiro con tileset pixel 16×16.
 */

export const PELETEIRO_TILESET_KEY = 'tileset-peleteiro';
export const PELETEIRO_TILESET_PATH = 'assets/tilesets/peleteiro.png';
export const PELETEIRO_TILE_SIZE = 16;
export const PELETEIRO_FRAME_COUNT = 35;

export const PELETEIRO_FRAMES = {
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

/**
 * Resuelve índice de frame do tileset para un carácter ASCII do layout.
 */
export function resolvePeleteiroFrame(ch, tx, ty, rows) {
  const patio = isPatioMap(rows);

  switch (ch) {
    case '#':
      return patio ? PELETEIRO_FRAMES.WALL_OUT : PELETEIRO_FRAMES.WALL_IN;
    case 'a':
      return (tx + ty) & 1 ? PELETEIRO_FRAMES.ASPHALT_B : PELETEIRO_FRAMES.ASPHALT_A;
    case 's':
      return PELETEIRO_FRAMES.SIDEWALK;
    case 'B':
      return (tx * 3 + ty) % 5 === 0 ? PELETEIRO_FRAMES.BUILDING_WIN : PELETEIRO_FRAMES.BUILDING;
    case '.':
      return (tx + ty) & 1 ? PELETEIRO_FRAMES.FLOOR_ALT : PELETEIRO_FRAMES.FLOOR;
    case 'F':
      return PELETEIRO_FRAMES.FIRE;
    case 'L':
      return PELETEIRO_FRAMES.LOCKER;
    case 'u': {
      const step = stairStepIndex(rows, tx, ty, 'u');
      return PELETEIRO_FRAMES.STAIR_UP_0 + step;
    }
    case 'v': {
      const step = stairStepIndex(rows, tx, ty, 'v');
      return PELETEIRO_FRAMES.STAIR_DOWN_0 + step;
    }
    case 'D':
      return PELETEIRO_FRAMES.DOOR;
    case 'C':
      return PELETEIRO_FRAMES.CASITA;
    case 'm':
      return PELETEIRO_FRAMES.PALM_POT;
    case 't':
      return PELETEIRO_FRAMES.PALM_TRUNK;
    case 'P':
      return PELETEIRO_FRAMES.PALM_LEAF;
    case 'r':
      return PELETEIRO_FRAMES.CARPET_A;
    case 'R':
      return PELETEIRO_FRAMES.CARPET_B;
    case 'c':
      return PELETEIRO_FRAMES.CHAIR;
    case 'd':
      return PELETEIRO_FRAMES.DESK;
    case 'M':
      return PELETEIRO_FRAMES.TEACHER_DESK;
    case 'b':
      return PELETEIRO_FRAMES.BOOKSHELF;
    case 'e':
      return PELETEIRO_FRAMES.DISPLAY;
    case 'p':
      return PELETEIRO_FRAMES.BLACKBOARD;
    case 'n':
      return PELETEIRO_FRAMES.BENCH;
    case 'o':
      return PELETEIRO_FRAMES.COMPUTER;
    case 'i':
      return PELETEIRO_FRAMES.PLANT_INDOOR;
    default:
      return patio ? PELETEIRO_FRAMES.ASPHALT_A : PELETEIRO_FRAMES.FLOOR;
  }
}

export function queuePeleteiroTileset(scene) {
  if (scene.textures.exists(PELETEIRO_TILESET_KEY)) return;
  scene.load.spritesheet(PELETEIRO_TILESET_KEY, PELETEIRO_TILESET_PATH, {
    frameWidth: PELETEIRO_TILE_SIZE,
    frameHeight: PELETEIRO_TILE_SIZE,
  });
}

export function ensurePeleteiroTextureFilter(scene) {
  const tex = scene.textures.get(PELETEIRO_TILESET_KEY);
  if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

/**
 * Constrúe a capa de suelo como RenderTexture (un draw por tile).
 */
export function buildPeleteiroFloorLayer(scene, cfg) {
  ensurePeleteiroTextureFilter(scene);
  const { rows, tileSize, width, height } = cfg;
  const rt = scene.add.renderTexture(0, 0, width, height);
  rt.setOrigin(0, 0);
  rt.setDepth(3);

  for (let ty = 0; ty < rows.length; ty++) {
    const row = rows[ty];
    for (let tx = 0; tx < row.length; tx++) {
      const ch = row[tx];
      const frame = resolvePeleteiroFrame(ch, tx, ty, rows);
      const x = tx * tileSize;
      const y = ty * tileSize;
      rt.drawFrame(PELETEIRO_TILESET_KEY, frame, x, y);
    }
  }

  return rt;
}
