/**
 * Xera capas base + manifest de props para Peleteiro (até importar arte Sprite Forge).
 * Invocado automaticamente por npm run play (ensure-play-assets).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import { TILE, COLS, resolvePeleteiroFrame, underlayCharForProp } from './peleteiro-frame-map.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const TILESET = path.join(ROOT, 'public', 'assets', 'tilesets', 'peleteiro.png');
const BUILT = path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'built');
const SOURCE = path.join(ROOT, 'public', 'assets', 'interiors', 'peleteiro', 'source');

const PROP_CHARS = new Set([
  'c',
  'd',
  'M',
  'b',
  'e',
  'p',
  'n',
  'o',
  'i',
  'm',
  't',
  'P',
  'C',
  'S',
  'w',
]);

const PROP_KEYS = {
  c: 'chair',
  d: 'desk',
  M: 'teacher-desk',
  b: 'bookshelf',
  e: 'display',
  p: 'blackboard',
  n: 'bench',
  o: 'computer',
  i: 'plant',
  m: 'palm-pot',
  t: 'palm-trunk',
  P: 'palm-leaf',
  C: 'casita',
  S: 'skeleton-prop',
  W: 'wisp',
};

async function loadLayouts() {
  const patio = await import('../../public/js/interiors/layouts/peleteiro-patio.layout.js');
  const floor = await import('../../public/js/interiors/layouts/peleteiro-floor.layout.js');
  return [
    { key: 'patio', layout: patio.buildPeleteiroPatioLayout() },
    { key: 'floor-1', layout: floor.buildPeleteiroFloorLayout(1) },
    { key: 'floor-2', layout: floor.buildPeleteiroFloorLayout(2) },
    { key: 'floor-3', layout: floor.buildPeleteiroFloorLayout(3) },
  ];
}

function blitFrame(tileset, out, frame, dx, dy) {
  const col = frame % COLS;
  const row = Math.floor(frame / COLS);
  const sx = col * TILE;
  const sy = row * TILE;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const si = ((sy + y) * tileset.width + (sx + x)) << 2;
      const a = tileset.data[si + 3];
      if (a < 8) continue;
      const di = ((dy + y) * out.width + (dx + x)) << 2;
      out.data[di] = tileset.data[si];
      out.data[di + 1] = tileset.data[si + 1];
      out.data[di + 2] = tileset.data[si + 2];
      out.data[di + 3] = tileset.data[si + 3];
    }
  }
}

function bakeZone(tileset, layout, zoneKey) {
  const rows = layout.rows;
  const h = rows.length;
  const w = rows[0].length;
  const zoneDir = path.join(BUILT, zoneKey);
  fs.mkdirSync(zoneDir, { recursive: true });

  const hdBase = path.join(zoneDir, 'base.png');
  const placements = [];

  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < rows[ty].length; tx++) {
      const ch = rows[ty][tx];
      if (PROP_CHARS.has(ch)) {
        placements.push({ tx, ty, key: PROP_KEYS[ch], frame: resolvePeleteiroFrame(ch, tx, ty, rows) });
      }
    }
  }

  let width = w * TILE;
  let height = h * TILE;
  let source = zoneKey === 'patio' ? 'hd-patio' : 'forge-layout';
  if (fs.existsSync(hdBase)) {
    const hd = PNG.sync.read(fs.readFileSync(hdBase));
    width = hd.width;
    height = hd.height;
  } else {
    const out = new PNG({ width, height });
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < rows[ty].length; tx++) {
        const ch = rows[ty][tx];
        if (PROP_CHARS.has(ch)) {
          const under = underlayCharForProp(ch, tx, ty, rows);
          blitFrame(tileset, out, resolvePeleteiroFrame(under, tx, ty, rows), tx * TILE, ty * TILE);
        } else {
          blitFrame(tileset, out, resolvePeleteiroFrame(ch, tx, ty, rows), tx * TILE, ty * TILE);
        }
      }
    }
    fs.writeFileSync(hdBase, PNG.sync.write(out));
    source = 'baked-tiles-fallback';
  }

  const HD_SKIP_PROPS = new Set([
    'm',
    't',
    'P',
    'C',
    'palm-pot',
    'palm-trunk',
    'palm-leaf',
    'casita',
    'skeleton-prop',
    'wisp',
  ]);
  const skipPropsOnBase =
    zoneKey !== 'patio' &&
    (source === 'hd-painted' || source === 'sprite-forge' || source === 'forge-layout');
  const finalPlacements = skipPropsOnBase
    ? placements.filter((p) => !HD_SKIP_PROPS.has(p.key))
    : placements;

  const manifest = {
    zone: zoneKey,
    width,
    height,
    tileSize: TILE,
    tileset: 'assets/tilesets/peleteiro.png',
    placements: finalPlacements,
    source,
  };
  fs.writeFileSync(path.join(zoneDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

function importForgeSource(zoneKey, layout) {
  const srcBase = path.join(SOURCE, zoneKey, 'base-ground.png');
  const builtBase = path.join(BUILT, zoneKey, 'base.png');
  if (!fs.existsSync(srcBase)) return false;
  // Non sobrescribir pintura HD co tileset xerado (ficheiros pequenos < 20 KB)
  if (fs.existsSync(builtBase) && fs.statSync(srcBase).size < 20_000) return false;

  const zoneDir = path.join(BUILT, zoneKey);
  fs.mkdirSync(zoneDir, { recursive: true });
  fs.copyFileSync(srcBase, builtBase);

  const manifestPath = path.join(zoneDir, 'manifest.json');
  let manifest = { zone: zoneKey, tileSize: TILE, placements: [] };
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  manifest.source = 'sprite-forge';
  manifest.forge = path.join('source', zoneKey, 'forge-meta.json');
  manifest.width = layout.width;
  manifest.height = layout.height;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  ↳ base Sprite Forge importada: ${zoneKey}`);
  return true;
}

async function main() {
  if (!fs.existsSync(TILESET)) {
    console.error('Falta tileset. Executa: npm run sprites:peleteiro');
    process.exit(1);
  }
  const tileset = PNG.sync.read(fs.readFileSync(TILESET));
  const zones = await loadLayouts();

  console.log('Peleteiro — manifest props (+ base tile fallback se falta HD)\n');
  for (const { key, layout } of zones) {
    bakeZone(tileset, layout, key);
  }
  for (const { key, layout } of zones) {
    importForgeSource(key, layout);
  }
  console.log(`\n✓ ${zones.length} zonas → public/assets/interiors/peleteiro/built/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
