import { fillGrid, rect, createLayout } from '../layout-utils.js';



/** Patio real Peleteiro: asfalto, U de edificios, palmera, caseta portería. */

const W = 58;

const H = 44;

const STAIR_X0 = 24;

const STAIR_COLS = 9;

const STAIR_ROWS = 4;



function paintStairs(g, y0, char) {

  for (let y = y0; y < y0 + STAIR_ROWS; y++) {

    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = char;

  }

}



function paintPalmeraMaceta(g, W, H, cx, cy) {

  for (let dy = -2; dy <= 2; dy++) {

    for (let dx = -2; dx <= 2; dx++) {

      if (dx * dx + dy * dy > 6) continue;

      const x = cx + dx;

      const y = cy + dy;

      if (y < 0 || y >= H || x < 0 || x >= W) continue;

      if (g[y][x] !== 'a' && g[y][x] !== 's') continue;

      if (dx === 0 && dy === -1) g[y][x] = 'P';

      else if (dx === 0 && dy === 0) g[y][x] = 't';

      else g[y][x] = 'm';

    }

  }

}



function paintCasitaRoja(g, W, H, x0, y0, cols, rows) {

  for (let y = y0; y < y0 + rows; y++) {

    for (let x = x0; x < x0 + cols; x++) {

      if (y < 0 || y >= H || x < 0 || x >= W) continue;

      if (g[y][x] === 'a' || g[y][x] === 's') g[y][x] = 'C';

    }

  }

}



export function buildPeleteiroPatioLayout() {

  const g = fillGrid(W, H, '#');



  const x0 = 11;

  const x1 = W - 12;

  const y0 = 11;

  const y1 = H - 4;



  rect(g, W, H, x0, y0, x1, y1, 'a');

  for (let y = y1 - 2; y <= y1; y++) {

    for (let x = 26; x <= 32; x++) g[y][x] = 'a';

  }



  rect(g, W, H, 2, 8, 10, H - 7, 'B');

  rect(g, W, H, W - 11, 6, W - 3, H - 7, 'B');

  rect(g, W, H, W - 13, 3, W - 3, 9, 'B');

  rect(g, W, H, 2, 2, W - 3, 9, 'B');



  const ySop = y0;

  const ySopEnd = H - 7;

  for (let y = ySop; y <= ySopEnd; y++) g[y][x0] = 's';

  for (let y = ySop; y <= ySopEnd; y++) g[y][x1] = 's';

  for (let x = x0; x <= x1; x++) g[ySop][x] = 's';



  for (let y = 6; y <= 10; y++) {

    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = 'a';

  }

  paintStairs(g, 6, 'u');



  const PALM_CX = 42;

  const PALM_CY = 34;

  const CASA_X0 = 40;

  const CASA_Y0 = 22;

  const CASA_COLS = 5;

  const CASA_ROWS = 4;



  paintCasitaRoja(g, W, H, CASA_X0, CASA_Y0, CASA_COLS, CASA_ROWS);

  paintPalmeraMaceta(g, W, H, PALM_CX, PALM_CY);



  for (let y = H - 6; y <= H - 4; y++) {

    for (let x = 25; x <= 33; x++) g[y][x] = 'a';

  }

  g[H - 5][28] = 'D';

  g[H - 5][29] = 'D';

  g[H - 5][30] = 'D';

  g[H - 4][29] = 'D';



  const stairCx = STAIR_X0 + Math.floor(STAIR_COLS / 2);

  const rows = g.map((row) => row.join(''));



  return createLayout({

    tileSize: 16,

    tileset: 'peleteiro-forge',

    rows,

    colors: {},

    blocked: ['#', 'B', 'P', 't', 'm', 'C'],

    entry: { tx: stairCx, ty: H - 5 },

    entryFromDown: { tx: stairCx, ty: 11 },

    exitChar: 'D',

    stairLabels: [

      {

        x: (STAIR_X0 + STAIR_COLS / 2) * 16,

        y: 8 * 16,

        text: '↑ ENTRAR (1º)',

      },

    ],

  });

}

