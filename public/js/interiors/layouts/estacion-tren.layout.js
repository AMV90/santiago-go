import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 44;
const H = 18;

const COLORS = {
  '#': 0x3d4f5c,
  '.': 0xc5cdd4,
  P: 0x4a5568,
  T: 0x1e3a5f,
  B: 0x5c6b7a,
  K: 0x2c5282,
  V: 0x1565c0,
  A: 0x263238,
  D: 0x6b5030,
};

export const ESTACION_CHATTER = [
  {
    id: 'est-viaj-1',
    tx: 8,
    ty: 8,
    tint: 0x90caf9,
    phrases: [
      'O AVE a Madrid sae en dez minutos… ou en «información provisional».',
      'Billete a A Coruña: cola na máquina e paciencia no alma.',
      'Mochila pesada, pero a estación está máis preta ca eu.',
      'De quen ves sendo? Con esa mochila, de quen leva a casa enteira.',
    ],
  },
  {
    id: 'est-viaj-2',
    tx: 22,
    ty: 9,
    tint: 0xffcc80,
    phrases: [
      'Camiño feito; agora tren, siesta e contar a historia outra vez.',
      'Andén 3 — mirade o panel antes de correr como mozo.',
      'Adif di «retraso por obras». Eu digo «café e calma».',
      'Xa me quero xubilar, pero o tren non me dá de baixa.',
    ],
  },
  {
    id: 'est-viaj-3',
    tx: 34,
    ty: 8,
    tint: 0xa5d6a7,
    phrases: [
      'Café na máquina, que a humanidade da taquilla tamén descansa.',
      'UIC 7131400 — iso pon na guía, eu pon «Compostela» no corazón.',
      'Primeira vez en Castelao: impresión boa, cheiro a viaxe.',
      'Picholeiro do andén? Non, só un señor perdido con maleta verde.',
    ],
  },
];

export function buildEstacionTrenLayout() {
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 1, 1, W - 2, H - 2, '.');
  rect(g, W, H, 2, 2, W - 3, 3, 'A');

  rect(g, W, H, 2, 5, 8, 6, 'T');
  rect(g, W, H, W - 9, 5, W - 3, 6, 'T');
  g[5][12] = 'K';
  g[5][30] = 'K';

  for (let x = 4; x <= W - 5; x += 5) {
    g[11][x] = 'B';
    g[11][x + 1] = 'B';
  }

  // Andéns laterais; pasillo central cara á porta (sur)
  rect(g, W, H, 1, 13, 17, 14, 'P');
  rect(g, W, H, 26, 13, W - 2, 14, 'P');
  g[14][10] = 'V';
  g[14][33] = 'V';
  for (let y = 13; y <= 15; y++) {
    for (let x = 19; x <= 24; x++) g[y][x] = '.';
  }

  g[15][20] = 'D';
  g[15][21] = 'D';
  g[15][22] = 'D';
  g[16][21] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'T', 'B', 'K', 'P', 'V', 'A'],
    entry: { tx: 21, ty: 12 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'A') {
        gfx.fillStyle(0x00e676, 0.85);
        gfx.fillRect(x + 2, y + 4, tileSize - 4, 3);
        gfx.fillStyle(0xffeb3b, 0.7);
        gfx.fillRect(x + 4, y + 8, tileSize - 8, 2);
      }
      if (ch === 'T') {
        gfx.fillStyle(0xffffff, 0.25);
        gfx.fillRect(x + 1, y + 3, tileSize - 2, 4);
        gfx.fillStyle(0x1565c0, 0.5);
        gfx.fillRect(x + 3, y + 9, tileSize - 6, tileSize - 10);
      }
      if (ch === 'K') {
        gfx.fillStyle(0x4fc3f7, 0.6);
        gfx.fillRect(x + 4, y + 3, tileSize - 8, tileSize - 6);
      }
      if (ch === 'B') {
        gfx.fillStyle(0x78909c, 0.8);
        gfx.fillRect(x + 1, y + 6, tileSize - 2, tileSize - 8);
      }
      if (ch === 'P') {
        gfx.fillStyle(0xffd54f, 0.35);
        gfx.fillRect(x, y + 2, tileSize, 2);
      }
      if (ch === 'V') {
        gfx.fillStyle(0xffffff, 0.2);
        gfx.fillRect(x + 3, y + 4, tileSize - 6, tileSize - 8);
      }
    },
  });
}
