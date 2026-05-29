import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 58;
const H = 46;

const COLORS = {
  '#': 0x4a3828,
  '.': 0xc4b08a,
  '=': 0xd8c890,
  P: 0x7a6548,
  a: 0xb8860b,
  T: 0x9a7b4f,
  D: 0x6b4423,
  r: 0xa8c898,
};

export function buildCatedralLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 18, 8, 39, 44, '.');
  for (let y = 8; y <= 44; y++) {
    g[y][28] = '=';
    g[y][29] = '=';
  }

  rect(g, W, H, 6, 21, 51, 29, '.');
  for (let y = 21; y <= 29; y++) {
    g[y][28] = '=';
    g[y][29] = '=';
  }

  rect(g, W, H, 16, 2, 41, 7, 'a');
  rect(g, W, H, 20, 0, 37, 1, 'a');

  rect(g, W, H, 8, 13, 15, 16, 'T');
  rect(g, W, H, 8, 34, 15, 37, 'T');
  rect(g, W, H, 42, 13, 49, 16, 'T');
  rect(g, W, H, 42, 34, 49, 37, 'T');

  for (let y = 10; y <= 42; y += 3) {
    if (g[y][20] === '.') g[y][20] = 'P';
    if (g[y][37] === '.') g[y][37] = 'P';
    if (y % 6 === 0) {
      if (g[y][24] === '.') g[y][24] = 'P';
      if (g[y][33] === '.') g[y][33] = 'P';
    }
  }
  for (let x = 10; x <= 48; x += 6) {
    if (g[21][x] === '.') g[21][x] = 'P';
    if (g[29][x] === '.') g[29][x] = 'P';
  }

  rect(g, W, H, 44, 12, 56, 40, '#');
  rect(g, W, H, 46, 14, 54, 38, 'r');
  for (let x = 46; x <= 54; x++) {
    g[14][x] = 'P';
    g[38][x] = 'P';
  }
  for (let y = 14; y <= 38; y++) {
    g[y][46] = 'P';
    g[y][54] = 'P';
  }
  rect(g, W, H, 47, 15, 53, 37, 'r');
  rect(g, W, H, 40, 24, 43, 28, '.');

  rect(g, W, H, 2, 36, 14, 43, '.');
  rect(g, W, H, 14, 38, 17, 41, '.');

  rect(g, W, H, 8, 13, 15, 16, 'T');
  rect(g, W, H, 8, 34, 15, 37, 'T');
  rect(g, W, H, 42, 13, 49, 16, 'T');
  rect(g, W, H, 42, 34, 49, 37, 'T');

  g[14][16] = '.';
  g[15][16] = '.';
  g[14][17] = '.';
  g[15][17] = '.';
  g[14][40] = '.';
  g[15][40] = '.';
  g[14][41] = '.';
  g[15][41] = '.';
  g[35][16] = '.';
  g[36][16] = '.';
  g[35][17] = '.';
  g[36][17] = '.';
  g[35][40] = '.';
  g[36][40] = '.';
  g[35][41] = '.';
  g[36][41] = '.';

  for (let x = 26; x <= 31; x++) g[43][x] = '.';
  g[44][27] = 'D';
  g[44][28] = 'D';
  g[44][29] = 'D';
  g[44][30] = 'D';
  g[43][28] = 'D';
  g[43][29] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'P'],
    entry: { tx: 29, ty: 42 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'P') {
        gfx.fillStyle(0x5a4a38, 1);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, tileSize * 0.32);
      }
    },
  });
}

export const CATHEDRAL_BATTLE_NPCS = [
  {
    id: 'priest-nave',
    name: 'Crego da nave',
    title: 'sotana branca · nv. 30',
    level: 30,
    tx: 11,
    ty: 15,
    sprite: 'priest',
    archetype: 'clergy',
    characterId: 'priest',
    faction: 'clergy',
    presentationLine: 'Un crego da nave alza a cruz e non cede terreo!',
    battleQuote:
      'Isto é casa de Deus, non de pelexas… pero se insistes, confesarei co puño.',
  },
  {
    id: 'priest-transept',
    name: 'Canónigo do cruzeiro',
    title: 'sotana branca · nv. 30',
    level: 30,
    tx: 45,
    ty: 15,
    sprite: 'priest',
    archetype: 'clergy',
    characterId: 'priest',
    faction: 'clergy',
    presentationLine: 'O canónigo do cruzeiro mira desde o altar… e acepta o duelo.',
    battleQuote:
      'O incenso aínda fumea neste cruzeiro. Non profanes o ritual coa túa violencia.',
  },
];
