import { fillGrid, rect, createLayout } from '../layout-utils.js';
import { drawInteriorStairwell } from '../stair-art.js';

const W = 88;
const H = 58;
const STAIR_X0 = 40;
const STAIR_COLS = 8;
const STAIR_ROWS = 4;

/** Datos oficiais ECI Santiago (por_plantas) — 4 plantas xogables. */
export const CORTE_INGLES_FLOOR_INFO = {
  1: {
    eci: 'B',
    label: 'Corte Inglés · Planta baixa',
    subtitle: 'Deportes · Electrónica · Moda xoven · Librería · Bebés',
    zones: [
      { ch: 'S', x0: 7, y0: 9, x1: 30, y1: 28, name: 'Deportes', color: 0x2e7d32 },
      { ch: 'E', x0: 34, y0: 9, x1: 54, y1: 22, name: 'Electrónica', color: 0x455a64 },
      { ch: 'I', x0: 34, y0: 23, x1: 54, y1: 28, name: 'Informática', color: 0x546e7a },
      { ch: 'F', x0: 58, y0: 9, x1: 80, y1: 22, name: 'Moda xoven', color: 0xec407a },
      { ch: 'L', x0: 58, y0: 23, x1: 80, y1: 28, name: 'Librería', color: 0x8d6e63 },
      { ch: 'B', x0: 62, y0: 30, x1: 80, y1: 42, name: 'Bebés', color: 0xffcc80 },
      { ch: 'C', x0: 10, y0: 44, x1: 32, y1: 50, name: 'Cafetería', color: 0xbcaaa4 },
    ],
  },
  2: {
    eci: '1',
    label: 'Corte Inglés · Planta 1',
    subtitle: 'Zapaterías · Xoyería · Perfumería · Gourmet · Hipercor',
    zones: [
      { ch: 'Z', x0: 7, y0: 9, x1: 28, y1: 26, name: 'Zapaterías', color: 0x5d4037 },
      { ch: 'J', x0: 32, y0: 9, x1: 52, y1: 20, name: 'Xoyería · reloxos', color: 0xffd54f },
      { ch: 'P', x0: 56, y0: 9, x1: 80, y1: 20, name: 'Perfumería', color: 0xf48fb1 },
      { ch: 'G', x0: 8, y0: 30, x1: 48, y1: 48, name: 'Hipercor · Gourmet', color: 0xc62828 },
      { ch: 'R', x0: 52, y0: 24, x1: 80, y1: 34, name: 'Parafarmacia', color: 0x4dd0e1 },
      { ch: 'N', x0: 52, y0: 38, x1: 80, y1: 48, name: 'Prensa', color: 0x90a4ae },
    ],
  },
  3: {
    eci: '2',
    label: 'Corte Inglés · Planta 2',
    subtitle: 'Moda home · Moda muller · Lencería',
    zones: [
      { ch: 'W', x0: 7, y0: 9, x1: 38, y1: 48, name: 'Moda muller', color: 0xad1457 },
      { ch: 'H', x0: 42, y0: 9, x1: 68, y1: 48, name: 'Moda home', color: 0x1565c0 },
      { ch: 'Y', x0: 72, y0: 18, x1: 80, y1: 38, name: 'Lencería', color: 0xf8bbd9 },
    ],
  },
  4: {
    eci: '3',
    label: 'Corte Inglés · Planta 3',
    subtitle: 'Fogar · Decoración · Restaurante',
    zones: [
      { ch: 'O', x0: 7, y0: 9, x1: 72, y1: 42, name: 'Fogar e decoración', color: 0x6d4c41 },
      { ch: 'C', x0: 58, y0: 44, x1: 80, y1: 50, name: 'Cafetería', color: 0xbcaaa4 },
      { ch: 'T', x0: 10, y0: 44, x1: 38, y1: 50, name: 'Restaurante', color: 0x8d6e63 },
    ],
  },
};

function paintStairs(g, y0, char) {
  for (let y = y0; y < y0 + STAIR_ROWS; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = char;
  }
}

function paintZones(g, zones) {
  for (const z of zones) {
    rect(g, W, H, z.x0, z.y0, z.x1, z.y1, z.ch);
    for (let y = z.y0 + 1; y < z.y1; y++) {
      g[y][z.x0 + 1] = '.';
      g[y][z.x1 - 1] = '.';
    }
    for (let x = z.x0 + 2; x < z.x1 - 1; x++) {
      g[z.y0 + 1][x] = '.';
      g[z.y1 - 1][x] = '.';
    }
  }
}

function drawZoneLabels(gfx, zones, ts) {
  for (const z of zones) {
    const cx = ((z.x0 + z.x1) / 2) * ts;
    const cy = ((z.y0 + z.y1) / 2) * ts;
    const tw = Math.min(z.name.length * 5.5 + 10, (z.x1 - z.x0 + 1) * ts - 4);
    gfx.fillStyle(0x000000, 0.55);
    gfx.fillRect(cx - tw / 2, cy - 6, tw, 12);
    gfx.fillStyle(0xffffff, 0.95);
    // Phaser Graphics sin texto: faixa clara co nome en overlay de tiles
    gfx.fillRect(cx - tw / 2 + 2, cy - 4, tw - 4, 8);
  }
}

function drawZoneBanners(scene, zones, ts) {
  const texts = [];
  for (const z of zones) {
    const cx = ((z.x0 + z.x1) / 2) * ts;
    const cy = ((z.y0 + z.y1) / 2) * ts;
    const t = scene.add.text(cx, cy, z.name, {
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      fontSize: z.name.length > 14 ? '9px' : '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.65)',
      padding: { x: 5, y: 2 },
    });
    t.setOrigin(0.5, 0.5);
    t.setDepth(7);
    texts.push(t);
  }
  return texts;
}

export function buildCorteInglesFloorLayout(floor) {
  const meta = CORTE_INGLES_FLOOR_INFO[floor];
  const g = fillGrid(W, H, '#');

  rect(g, W, H, 5, 5, W - 6, H - 6, '.');

  for (let y = 8; y <= H - 14; y++) {
    for (let x = STAIR_X0; x < STAIR_X0 + STAIR_COLS; x++) g[y][x] = '.';
  }

  paintZones(g, meta.zones);
  paintStairs(g, H - 12, 'v');
  if (floor < 4) paintStairs(g, 7, 'u');

  const colors = {
    '#': 0x263238,
    '.': 0xeceff1,
    u: 0x9e9e9e,
    v: 0x9e9e9e,
    D: 0x6d4c41,
  };
  for (const z of meta.zones) colors[z.ch] = z.color;

  const blocked = ['#'];
  const stairCx = STAIR_X0 + Math.floor(STAIR_COLS / 2);

  if (floor === 1) {
    for (let x = stairCx - 3; x <= stairCx + 3; x++) {
      g[H - 6][x] = 'D';
      g[H - 5][x] = 'D';
    }
  }

  const zoneLabels = meta.zones.map((z) => ({
    x: ((z.x0 + z.x1) / 2) * 16,
    y: ((z.y0 + z.y1) / 2) * 16,
    text: z.name,
  }));

  const rows = g.map((row) => row.join(''));

  return createLayout({
    tileSize: 16,
    rows,
    colors,
    blocked,
    entry: { tx: stairCx, ty: H - 14 },
    entryFromUp: { tx: stairCx, ty: H - 13 },
    entryFromDown: { tx: stairCx, ty: 7 + STAIR_ROWS },
    exitChar: 'D',
    drawTileExtra(gfx, ch, x, y, ts) {
      const z = meta.zones.find((zz) => zz.ch === ch);
      if (z) {
        gfx.fillStyle(0xffffff, 0.08);
        gfx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
      }
      if (ch === 'G') {
        gfx.fillStyle(0xffffff, 0.15);
        gfx.fillRect(x + 3, y + 4, ts - 6, 3);
      }
    },
    drawOverlay(gfx, ts) {
      if (floor < 4) {
        drawInteriorStairwell(gfx, STAIR_X0 * ts, 7 * ts, ts, {
          cols: STAIR_COLS,
          rows: STAIR_ROWS,
          direction: 'up',
        });
      }
      drawInteriorStairwell(gfx, STAIR_X0 * ts, (H - 12) * ts, ts, {
        cols: STAIR_COLS,
        rows: STAIR_ROWS,
        direction: 'down',
      });
      drawZoneLabels(gfx, meta.zones, ts);
    },
    stairLabels: [
      ...(floor < 4
        ? [{ x: stairCx * 16, y: 9 * 16, text: `↑ Planta ${floor + 1}` }]
        : []),
      {
        x: stairCx * 16,
        y: (H - 10) * 16,
        text: floor === 1 ? '↓ Saír' : `↓ Planta ${floor - 1}`,
      },
    ],
    zoneLabels,
    spawnZoneBanners: (scene, ts) => drawZoneBanners(scene, meta.zones, ts),
    floorMeta: meta,
  });
}
