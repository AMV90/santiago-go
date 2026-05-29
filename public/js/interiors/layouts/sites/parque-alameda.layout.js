import { fillGrid, rect } from '../../layout-utils.js';
import { carveSouthExit, finishLayout } from './_helpers.js';

/**
 * Parque da Alameda — escala urbana (~750 m).
 * Tres zonas: Paseo da Alameda · Carballeira de Santa Susana · Paseo da Ferradura.
 * Igrexa de Santa Susana (centro), Capilla do Pilar, charcas con patos, as dúas Marías.
 */
const W = 96;
const H = 76;

export const PARQUE_ALAMEDA_PATRONS = [
  { tx: 38, ty: 52 },
  { tx: 58, ty: 48 },
  { tx: 22, ty: 28 },
  { tx: 72, ty: 34 },
];

function plantOaks(g, x0, y0, x1, y1, density = 5) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (g[y][x] !== 'g') continue;
      if ((x * 3 + y * 7) % density === 0) g[y][x] = 'T';
    }
  }
}

function carveEllipsePath(g, cx, cy, rx, ry, a0, a1, step = 0.04) {
  for (let a = a0; a <= a1; a += step) {
    const x = Math.round(cx + rx * Math.cos(a));
    const y = Math.round(cy + ry * Math.sin(a));
    if (g[y]?.[x] === 'g' || g[y][x] === 'T') g[y][x] = '.';
  }
}

function pond(g, x0, y0, x1, y1) {
  rect(g, W, H, x0, y0, x1, y1, 'w');
  const mx = Math.floor((x0 + x1) / 2);
  const my = Math.floor((y0 + y1) / 2);
  g[my][mx] = 'U';
  g[my][mx - 1] = 'U';
  g[my][mx + 1] = 'U';
  if (my + 1 <= y1) g[my + 1][mx] = 'U';
}

export function buildParqueAlamedaLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 1, 1, W - 2, H - 2, 'g');

  // —— Paseo da Alameda (eixo central norte–sur) ——
  for (let y = 10; y <= H - 9; y++) {
    for (let x = 44; x <= 51; x++) g[y][x] = '.';
  }
  for (let y = 12; y <= H - 11; y += 2) {
    g[y][43] = 'B';
    g[y][52] = 'B';
  }

  // —— Carballeira de Santa Susana (robledal) ——
  rect(g, W, H, 32, 8, 68, 38, 'g');
  plantOaks(g, 32, 8, 68, 38, 4);
  for (let y = 14; y <= 34; y++) {
    for (let x = 46; x <= 53; x++) g[y][x] = '.';
  }

  // —— Paseo da Ferradura (arco oeste, mirador á Catedral) ——
  carveEllipsePath(g, 22, 38, 18, 28, Math.PI * 0.55, Math.PI * 1.45);
  for (let y = 18; y <= 58; y++) {
    g[y][14] = '.';
    g[y][15] = '.';
  }

  // —— Paseos transversais ——
  rect(g, W, H, 20, 48, 42, 49, '.');
  rect(g, W, H, 54, 48, 76, 49, '.');
  rect(g, W, H, 44, 38, 51, 42, '.');

  plantOaks(g, 4, 8, 28, 22, 6);
  plantOaks(g, 70, 8, 90, 28, 6);
  plantOaks(g, 6, 62, 40, 72, 5);
  plantOaks(g, 58, 58, 90, 72, 5);

  // —— Charcas con patos (varios estanques do parque) ——
  pond(g, 8, 44, 18, 52);
  pond(g, 22, 58, 32, 66);
  pond(g, 74, 50, 84, 58);
  pond(g, 62, 62, 72, 70);

  // —— Edificios e monumentos (despois do robledal, para non se borren) ——
  rect(g, W, H, 46, 16, 53, 24, 'I');
  g[20][49] = 'i';
  rect(g, W, H, 72, 42, 79, 48, 'C');
  g[45][75] = 'c';
  rect(g, W, H, 10, 12, 18, 16, 'V');
  g[26][12] = 'L';
  g[27][13] = 'L';
  g[22][47] = 'F';
  rect(g, W, H, 45, 30, 46, 31, 'p');
  rect(g, W, H, 49, 31, 50, 32, 'p');
  g[31][46] = 'M';
  g[32][49] = 'M';

  const entry = carveSouthExit(g, W, H, 9);

  return finishLayout(
    g,
    {
      '#': 0x2e4a2e,
      g: 0x5a8f3c,
      '.': 0xc8e6a8,
      T: 0x2e7d32,
      B: 0x6d4c41,
      F: 0x4fc3f7,
      p: 0x9e9e9e,
      M: 0xb0bec5,
      V: 0x81d4fa,
      C: 0xefebe9,
      c: 0xd7ccc8,
      I: 0x8d6e63,
      i: 0xc9a227,
      w: 0x29b6f6,
      U: 0xffeb3b,
      L: 0xb0bec5,
      D: 0x6b5030,
    },
    ['#', 'T', 'B', 'F', 'p', 'M', 'C', 'c', 'I', 'i', 'w', 'U', 'L'],
    entry,
    (gfx, ch, x, y, ts) => {
      if (ch === 'T') {
        gfx.fillStyle(0x1b5e20, 0.95);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 7);
        gfx.fillStyle(0x33691e, 1);
        gfx.fillRect(x + ts / 2 - 1, y + ts - 5, 2, 5);
      }
      if (ch === 'M') {
        gfx.fillStyle(0x78909c, 1);
        gfx.fillRect(x + 3, y + 2, ts - 6, ts - 3);
        gfx.fillStyle(0xeceff1, 1);
        gfx.fillCircle(x + ts / 2, y + 5, 3);
        gfx.fillStyle(0x546e7a, 0.85);
        gfx.fillRect(x + 3, y + 9, 3, 5);
        gfx.fillRect(x + ts - 6, y + 9, 3, 5);
        gfx.fillStyle(0x90a4ae, 0.7);
        gfx.fillRect(x + 5, y + 3, ts - 10, 2);
      }
      if (ch === 'w') {
        gfx.fillStyle(0x0288d1, 0.55);
        gfx.fillRect(x, y, ts, ts);
        gfx.fillStyle(0x4fc3f7, 0.35);
        gfx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
      }
      if (ch === 'U') {
        gfx.fillStyle(0xffffff, 1);
        gfx.fillEllipse(x + ts / 2, y + ts / 2 + 1, 4, 3);
        gfx.fillStyle(0xff9800, 1);
        gfx.fillCircle(x + ts / 2 + 3, y + 4, 2);
      }
      if (ch === 'I' || ch === 'C') {
        gfx.fillStyle(0xf5f5f5, 0.15);
        gfx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
        if (ch === 'I') {
          gfx.fillStyle(0xc9a227, 0.55);
          gfx.fillTriangle(x + ts / 2, y + 3, x + 4, y + 9, x + ts - 4, y + 9);
        }
      }
      if (ch === 'i') {
        gfx.fillStyle(0xc9a227, 0.8);
        gfx.fillCircle(x + ts / 2, y + 4, 3);
      }
      if (ch === 'V') {
        gfx.fillStyle(0x5c6bc0, 0.4);
        gfx.fillRect(x + 1, y + 8, ts - 2, ts - 10);
        gfx.fillStyle(0xc9a227, 0.65);
        gfx.fillTriangle(x + ts / 2, y + 2, x + 3, y + 10, x + ts - 3, y + 10);
      }
      if (ch === 'L') {
        gfx.fillStyle(0x9e9e9e, 1);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 5);
        gfx.fillStyle(0x757575, 0.8);
        gfx.fillRect(x + 4, y + 8, ts - 8, 4);
      }
      if (ch === 'F') {
        gfx.fillStyle(0x29b6f6, 0.5);
        gfx.fillCircle(x + ts / 2, y + ts / 2, 5);
      }
    }
  );
}
