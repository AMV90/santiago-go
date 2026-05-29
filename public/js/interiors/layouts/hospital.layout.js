import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 22;
const H = 11;

const COLORS = {
  '#': 0x5a6a72,
  '.': 0xe8eef0,
  C: 0x27ae60,
  c: 0x1e8449,
  D: 0x8b6914,
};

/** Posición da recepcionista (debe coincidir co tile N na planta) */
export const HOSPITAL_RECEPTIONIST = {
  tx: 10,
  ty: 3,
  counterFrontTx: 10,
  counterFrontTy: 5,
  healRange: 52,
  dwellMs: 3000,
  healedLine: 'Xa estás curado. PS e movementos restaurados. Non me fagas volver hoxe.',
  farewellLine: 'Volve pronto… pero non por lo mesmo, que tamén temos retranca.',
  cooldownMs: 6000,
};

export function buildHospitalLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 6, 2, 15, 2, 'C');
  rect(g, W, H, 6, 3, 15, 3, 'c');

  g[HOSPITAL_RECEPTIONIST.ty][HOSPITAL_RECEPTIONIST.tx] = 'N';

  g[8][10] = 'D';
  g[9][10] = 'D';
  g[10][10] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'C', 'c', 'N'],
    entry: { tx: 10, ty: 8 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'C' || ch === 'c') {
        gfx.fillStyle(0xffffff, 0.35);
        gfx.fillRect(x + 1, y + 2, tileSize - 2, 4);
        gfx.fillStyle(0x1a5276, 0.25);
        gfx.fillRect(x + 2, y + 8, tileSize - 4, tileSize - 9);
      }
      if (ch === 'N') {
        gfx.fillStyle(0xffffff, 0.15);
        gfx.fillRect(x + 2, y + 4, tileSize - 4, tileSize - 6);
      }
    },
  });
}
