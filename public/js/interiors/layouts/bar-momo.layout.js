import { fillGrid, rect, createLayout } from '../layout-utils.js';

const W = 70;
const H = 14;
const TERRACE_X0 = 52;

const COLORS = {
  '#': 0x1a1420,
  '.': 0x3d2f28,
  B: 0x6b4423,
  s: 0x4a3828,
  T: 0x5c4033,
  t: 0x352820,
  D: 0x8b6914,
  J: 0x2ecc71,
  L: 0xff6b9d,
  a: 0x7a6548,
  O: 0x2e7d32,
  f: 0x4e342e,
  b: 0x6d4c41,
};

export function buildBarMomoLayout() {
  const g = fillGrid(W, H, '#');

  // —— Interior do bar (oeste) ——
  rect(g, W, H, 1, 1, TERRACE_X0 - 2, H - 2, '.');
  rect(g, W, H, 2, 2, TERRACE_X0 - 3, 2, 'B');
  rect(g, W, H, 2, 1, TERRACE_X0 - 3, 1, 'B');

  for (let x = 4; x <= TERRACE_X0 - 6; x += 3) {
    if (g[3][x] === '.') g[3][x] = 's';
  }

  for (let x = 10; x <= 40; x += 9) {
    g[6][x] = 'T';
    g[6][x + 1] = 'T';
    g[7][x] = 't';
    g[7][x + 1] = 't';
  }

  g[1][12] = 'L';
  g[1][26] = 'L';
  g[1][40] = 'L';

  // Acceso á terraza (fondo / leste)
  rect(g, W, H, TERRACE_X0 - 4, 5, TERRACE_X0 - 1, 9, '.');

  // —— Terraza ao fondo con árbores ——
  rect(g, W, H, TERRACE_X0, 1, W - 2, H - 2, 'a');
  for (let y = 2; y <= H - 3; y++) {
    g[y][TERRACE_X0] = 'f';
    g[y][W - 3] = 'f';
  }
  for (let x = TERRACE_X0; x <= W - 3; x++) g[1][x] = 'f';
  g[1][TERRACE_X0 + 4] = 'f';
  g[H - 2][TERRACE_X0 + 8] = 'f';

  const treeSpots = [
    [56, 3],
    [62, 4],
    [66, 3],
    [58, 8],
    [64, 9],
    [68, 7],
    [60, 11],
  ];
  for (const [tx, ty] of treeSpots) g[ty][tx] = 'O';

  rect(g, W, H, 54, 6, 55, 6, 'b');
  rect(g, W, H, 63, 6, 64, 6, 'b');
  g[10][58] = 's';
  g[10][65] = 's';
  g[5][W - 5] = 'J';

  // Porta oeste (saída ao mapa)
  g[5][1] = 'D';
  g[6][1] = 'D';
  g[7][1] = 'D';
  g[6][0] = 'D';

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors: COLORS,
    blocked: ['#', 'B', 'T', 'J', 'L', 'O', 'f', 'b'],
    entry: { tx: 3, ty: 6 },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, tileSize) {
      if (ch === 'B') {
        gfx.fillStyle(0x8b6914, 0.35);
        gfx.fillRect(x + 1, y + 4, tileSize - 2, tileSize - 5);
      }
      if (ch === 'L') {
        gfx.fillStyle(0xff6b9d, 0.55);
        gfx.fillRect(x + 4, y + 2, tileSize - 8, 4);
      }
      if (ch === 'J') {
        gfx.fillStyle(0x27ae60, 0.5);
        gfx.fillRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
      }
      if (ch === 's') {
        gfx.fillStyle(0x7a6548, 0.6);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, 3);
      }
      if (ch === 'a') {
        gfx.fillStyle(0x9e8b78, 0.25);
        gfx.fillRect(x, y, tileSize, tileSize);
      }
      if (ch === 'O') {
        gfx.fillStyle(0x1b5e20, 0.95);
        gfx.fillCircle(x + tileSize / 2, y + tileSize / 2, 7);
        gfx.fillStyle(0x33691e, 1);
        gfx.fillRect(x + tileSize / 2 - 1, y + tileSize - 5, 2, 5);
      }
      if (ch === 'f') {
        gfx.fillStyle(0x3e2723, 0.7);
        gfx.fillRect(x + 2, y + 4, tileSize - 4, tileSize - 6);
      }
      if (ch === 'b') {
        gfx.fillStyle(0x5d4037, 0.85);
        gfx.fillRect(x + 1, y + 7, tileSize - 2, tileSize - 8);
      }
    },
  });
}

export const BAR_MOMO_CHATTER = [
  {
    id: 'momo-1',
    tx: 4,
    ty: 3,
    tint: 0xffcc80,
    phrases: [
      'Unha caña do Momo e seguimos… ou non seguimos, tamén vale.',
      'Aquí o xacobeo sabe a cervexa e o taberneiro sabe o teu nome.',
      'A segunda ronda sabe mellor ca a primeira. A terceira, xa non xulgas.',
    ],
  },
  {
    id: 'momo-2',
    tx: 10,
    ty: 3,
    tint: 0xffcc80,
    phrases: [
      'De quen ves sendo? Con esa sede, do primo de Vedra.',
      'Se pedes auga, miranche raro. Se pedes Estrella, abrenche o corazón.',
      'O Camiño entra cos pés e sae coa garganta contenta.',
    ],
  },
  {
    id: 'momo-3',
    tx: 16,
    ty: 3,
    tint: 0xffcc80,
    phrases: [
      'Best pub do casco… en inglés dixérono; en galego, o noso.',
      'Picholeiro de profesión, cervexeiro de vocación.',
      'Aquí non hai wifi forte, pero hai conversa de sobra.',
    ],
  },
  {
    id: 'momo-4',
    tx: 22,
    ty: 2,
    tint: 0xffffff,
    emoji: '🍸',
    phrases: [
      'Que te ponho? Temos o cóctel peregrino e o da casa sen pretensión.',
      'Estrella ben fría ou explicación longa sobre por que non.',
      'Se queres sen alcohol, tamén te tratamos ben. Non te rias.',
    ],
  },
  {
    id: 'momo-5',
    tx: 28,
    ty: 3,
    tint: 0xffcc80,
    phrases: [
      'Outra ronda! Que mañá xa veremos… ou non veremos nada.',
      'O xubilado de al lado leva tres e segue contando a mesma historia.',
      'Ermos máis de grelos ou de cachelo? Aquí de cervexa, unánimes.',
    ],
  },
  {
    id: 'momo-6',
    tx: 34,
    ty: 3,
    tint: 0xffcc80,
    phrases: [
      'Esta barra non acaba nunca, como as historias do dono.',
      'Se che invitan, invita ti na seguinte. Así funciona Santiago.',
      'A tapa chegou tarde, pero chegou. Iso xa é victoria.',
    ],
  },
  {
    id: 'momo-7',
    tx: 58,
    ty: 6,
    tint: 0xa5d6a7,
    phrases: [
      'Na terraza respira-se mellor e a cervexa sabe a verán.',
      'Aquí compoñéronse medio Camiño debaixo destes árbores.',
      'Coñeceches a praza? Ben. Coñeceches a terraza? Mellor aínda.',
      'Non é retranca: é que o fresco convence sen discutir.',
    ],
  },
  {
    id: 'momo-8',
    tx: 64,
    ty: 9,
    tint: 0xa5d6a7,
    phrases: [
      'Un último chupito e vaímonos… dixo alguén hai dúas horas.',
      'O que pecha tarde abre alma. O Momo non é excepción.',
      'Se saes sen despedirte, volves. Sempre volves.',
      'De noite, as luces da terraza e os árbores: plan perfecto.',
    ],
  },
];
