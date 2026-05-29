import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 76;
const H = 52;
const STAIR_X0 = 34;
const STAIR_COLS = 8;

/** Pasillo principal horizontal (conexión entre escaleiras e salas). */
const CORR_Y0 = 23;
const CORR_Y1 = 29;
const CORR_X0 = 10;
const CORR_X1 = 66;

function paintStairs(g, y0, char) {
  for (let y = y0; y < y0 + 4; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = char;
  }
}

function openCorridor(g) {
  rect(g, W, H, CORR_X0, CORR_Y0, CORR_X1, CORR_Y1, '.');
  for (let y = CORR_Y0; y <= CORR_Y1; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = '.';
  }
}

/** Sala con muro `h` e porta na beirada indicada. */
function room(g, x0, y0, x1, y1, door) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const edge = x === x0 || x === x1 || y === y0 || y === y1;
      if (!edge) {
        g[y][x] = '.';
        continue;
      }
      const isDoor =
        door &&
        ((door.side === 'n' && y === y0 && x >= door.x0 && x <= door.x1) ||
          (door.side === 's' && y === y1 && x >= door.x0 && x <= door.x1) ||
          (door.side === 'w' && x === x0 && y >= door.y0 && y <= door.y1) ||
          (door.side === 'e' && x === x1 && y >= door.y0 && y <= door.y1));
      g[y][x] = isDoor ? '.' : 'h';
    }
  }
}

function furnishClassroom(g, x0, y0, x1, y1, opts = {}) {
  const withComputers = opts.computers ?? false;
  const cx = Math.floor((x0 + x1) / 2);
  for (let y = y0 + 2; y <= y1 - 2; y++) {
    for (let x = x0 + 2; x <= x1 - 2; x++) {
      if (g[y][x] !== '.') continue;
      g[y][x] = (x + y) % 2 === 0 ? 'r' : 'R';
    }
  }
  for (let x = x0 + 2; x <= x1 - 2; x++) {
    if (g[y0 + 1][x] === 'r' || g[y0 + 1][x] === 'R') g[y0 + 1][x] = 'p';
  }
  if (g[y0 + 2][cx] === 'r' || g[y0 + 2][cx] === 'R') g[y0 + 2][cx] = 'M';
  const desk = withComputers ? 'o' : 'd';
  for (let row = 0; row < 2; row++) {
    const y = y0 + 5 + row * 4;
    if (y > y1 - 3) break;
    for (let col = 0; col < 2; col++) {
      const x = x0 + 4 + col * 6;
      if (g[y][x] === 'r' || g[y][x] === 'R') g[y][x] = desk;
      if (g[y + 1]?.[x] === 'r' || g[y + 1]?.[x] === 'R') g[y + 1][x] = 'c';
    }
  }
}

function furnishLibrary(g, x0, y0, x1, y1) {
  for (let y = y0 + 2; y <= y1 - 2; y++) {
    for (let x = x0 + 2; x <= x1 - 2; x++) {
      if (g[y][x] === '.') g[y][x] = 'Y';
    }
  }
  for (let x = x0 + 2; x <= x1 - 2; x++) g[y0 + 2][x] = 'b';
  const cx = Math.floor((x0 + x1) / 2);
  g[y0 + 3][cx] = 'p';
  for (let x = x0 + 4; x <= x1 - 4; x += 5) {
    if (g[y1 - 2][x] === 'Y') g[y1 - 2][x] = 'n';
  }
}

/** 1º: pasillo + biblioteca (oeste) + aulas ao norte/sur. */
function buildFloor1(g) {
  openCorridor(g);

  room(g, 10, 9, 28, 21, { side: 's', x0: 16, x1: 22 });
  furnishLibrary(g, 11, 10, 27, 20);

  room(g, 48, 9, 66, 21, { side: 's', x0: 54, x1: 60 });
  furnishClassroom(g, 49, 10, 65, 20);

  room(g, 48, 31, 66, 43, { side: 'n', x0: 54, x1: 60 });
  furnishClassroom(g, 49, 32, 65, 42, { computers: true });

  room(g, 10, 31, 28, 43, { side: 'n', x0: 16, x1: 22 });
  furnishClassroom(g, 11, 32, 27, 42);
}

/** 2º: a planta É o pasillo (amplo) con aulas pequenas nos laterais. */
function buildFloor2(g) {
  rect(g, W, H, 10, 11, 66, 41, '.');
  openCorridor(g);

  for (let x = 14; x <= 58; x += 12) {
    if (g[CORR_Y0 - 1][x] === '.') g[CORR_Y0 - 1][x] = 'n';
    if (g[CORR_Y1 + 1][x] === '.') g[CORR_Y1 + 1][x] = 'n';
  }

  const northRooms = [
    [12, 8, 24, 10],
    [30, 8, 42, 10],
    [48, 8, 60, 10],
  ];
  const southRooms = [
    [12, 42, 24, 44],
    [30, 42, 42, 44],
    [48, 42, 60, 44],
  ];

  for (const [x0, y0, x1, y1] of northRooms) {
    room(g, x0, y0, x1, y1, { side: 's', x0: x0 + 3, x1: x0 + 7 });
    furnishClassroom(g, x0 + 1, y0 + 1, x1 - 1, y1 - 1, { computers: true });
    g[y0 + 1][x0 + 2] = 'F';
    g[y0 + 1][x1 - 2] = 'F';
  }
  for (const [x0, y0, x1, y1] of southRooms) {
    room(g, x0, y0, x1, y1, { side: 'n', x0: x0 + 3, x1: x0 + 7 });
    furnishClassroom(g, x0 + 1, y0 + 1, x1 - 1, y1 - 1);
    g[y1 - 1][x0 + 2] = 'F';
  }
}

/** 3º: pasillo vertical con ventanas (oeste) e aulas á dereita. */
function buildFloor3(g) {
  const cx0 = STAIR_X0;
  const cx1 = STAIR_X0 + STAIR_COLS - 1;
  for (let y = 9; y <= 43; y++) {
    for (let x = cx0; x <= cx1; x++) g[y][x] = '.';
  }

  for (let y = 10; y <= 42; y += 4) {
    g[y][cx0 - 1] = 'x';
    if (y + 2 <= 42) g[y + 2][cx0 - 1] = 'h';
  }

  const eastRooms = [
    { y0: 9, y1: 18, fire: true },
    { y0: 20, y1: 29, fire: false },
    { y0: 31, y1: 40, fire: true },
  ];

  for (const rm of eastRooms) {
    room(g, 46, rm.y0, 66, rm.y1, { side: 'w', y0: rm.y0 + 4, y1: rm.y0 + 6 });
    furnishClassroom(g, 47, rm.y0 + 1, 65, rm.y1 - 1, { computers: rm.fire });
    if (rm.fire) {
      g[rm.y0 + 2][47] = 'F';
      g[rm.y1 - 2][65] = 'F';
    }
    g[rm.y0 + 5][45] = 'w';
    g[rm.y0 + 7][45] = 'S';
  }

  for (let y = 9; y <= 43; y++) {
    for (let x = cx1 + 1; x <= 45; x++) {
      if (g[y][x] === '#') g[y][x] = '.';
    }
  }

  g[12][cx0 + 2] = 'w';
  g[36][cx0 + 4] = 'S';
}

export function buildPeleteiroFloorLayout(floor) {
  const g = fillGrid(W, H, '#');
  rect(g, W, H, 6, 6, W - 7, H - 7, '.');

  if (floor === 1) buildFloor1(g);
  else if (floor === 2) buildFloor2(g);
  else buildFloor3(g);

  paintStairs(g, H - 12, 'v');
  if (floor < 3) paintStairs(g, 7, 'u');

  for (let y = 7; y <= 10; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) {
      if (g[y][x] === '#') g[y][x] = '.';
    }
  }
  for (let y = H - 13; y <= H - 10; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) {
      if (g[y][x] === '#') g[y][x] = '.';
    }
  }

  const stairCx = STAIR_X0 + Math.floor(STAIR_COLS / 2);
  const rows = g.map((row) => row.join(''));

  const labels = [
    { x: stairCx * 16, y: 8 * 16, text: floor < 3 ? '↑ SUBIR (W)' : '↑ Azotea cerrada' },
    {
      x: stairCx * 16,
      y: (H - 9) * 16,
      text: floor === 1 ? '↓ BAIXAR ao patio (S)' : '↓ BAIXAR (S)',
    },
  ];
  if (floor === 1) labels.push({ x: 18 * 16, y: 15 * 16, text: 'Biblioteca' });
  if (floor === 2) labels.push({ x: 38 * 16, y: 26 * 16, text: 'Pasillo principal' });
  if (floor === 3) labels.push({ x: 38 * 16, y: 26 * 16, text: 'Pasillo · ventanas' });

  return createLayout({
    tileSize: 16,
    tileset: 'peleteiro-forge',
    rows,
    colors: {},
    blocked: ['#', 'h', 'F', 'c', 'd', 'M', 'b', 'e', 'p', 'n', 'o', 'i', 'S', 'w'],
    entry: { tx: stairCx, ty: H - 14 },
    entryFromUp: { tx: stairCx, ty: H - 11 },
    entryFromDown: { tx: stairCx, ty: 11 },
    exitChar: 'D',
    stairLabels: labels,
  });
}
