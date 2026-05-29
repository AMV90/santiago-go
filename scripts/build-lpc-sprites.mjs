/**
 * Compón personaxes LPC desde capas do xerador Universal LPC.
 * https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/
 *
 * Uso: npm run lpc:sync && npm run sprites:lpc
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compositeWalkLayers, writePng } from './lpc/composite-walk.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'lpc', 'characters.json');
const ARCHETYPES_PATH = path.join(__dirname, 'lpc', 'archetypes.json');
const OUT_ROOT = path.join(ROOT, 'public', 'assets', 'lpc');
const OUT_CHAR_DIR = path.join(OUT_ROOT, 'characters');
const IMPORT_DIR = path.join(ROOT, 'assets', 'lpc', 'import');
const CHAR_PATH_PREFIX = 'assets/lpc/characters';

/** Índices walk 576×256: filas norte, oeste, sur, leste (8 frames usados por fila). */
const WALK_DIRS = {
  up: { start: 0, end: 7 },
  left: { start: 9, end: 16 },
  down: { start: 18, end: 25 },
  right: { start: 27, end: 34 },
};

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const archetypes = fs.existsSync(ARCHETYPES_PATH)
    ? JSON.parse(fs.readFileSync(ARCHETYPES_PATH, 'utf8'))
    : null;
  const sourcesRoot = path.join(ROOT, config.sourcesRoot || '.lpc-src/spritesheets');

  if (!fs.existsSync(sourcesRoot)) {
    console.error(
      'Non hai capas LPC. Executa primeiro: npm run lpc:sync\n' +
        'Ou exporta PNG do xerador a assets/lpc/import/{id}.png'
    );
    process.exit(1);
  }

  const built = {};
  const manifest = {
    generator: 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/',
    license: 'CC-BY-SA 3.0 / varias — ver CREDITS no repo LPC e assets/lpc/CREDITS.md',
    frameWidth: config.frameWidth || 64,
    frameHeight: config.frameHeight || 64,
    walk: WALK_DIRS,
    characters: {},
    roles: config.roles,
    archetypes: archetypes
      ? {
          aliases: archetypes.aliases,
          pools: archetypes.pools,
          factionArchetype: archetypes.factionArchetype,
          battleProfiles: archetypes.battleProfiles,
        }
      : undefined,
  };

  for (const [id, def] of Object.entries(config.characters)) {
    const importPng = path.join(IMPORT_DIR, `${id}.png`);
    const outPath = path.join(OUT_CHAR_DIR, `${id}.png`);
    const textureKey = `lpc-${id}`;

    if (fs.existsSync(importPng)) {
      fs.mkdirSync(OUT_CHAR_DIR, { recursive: true });
      fs.copyFileSync(importPng, outPath);
      console.log(`✓ ${id} (import manual)`);
    } else if (def.layers?.length) {
      const layerPaths = def.layers.map((rel) => path.join(sourcesRoot, rel.replace(/\//g, path.sep)));
      const png = compositeWalkLayers(layerPaths);
      writePng(png, outPath);
      console.log(`✓ ${id} (${def.layers.length} capas)`);
    } else {
      console.warn(`⚠ ${id}: sen capas nin import`);
      continue;
    }

    built[id] = {
      texture: textureKey,
      path: `${CHAR_PATH_PREFIX}/${id}.png`,
      scale: def.scale ?? 0.5,
      label: def.label ?? id,
      ...(def.tint != null ? { tint: def.tint } : {}),
    };
  }

  manifest.characters = built;
  fs.mkdirSync(OUT_CHAR_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const jsOut = path.join(ROOT, 'public', 'js', 'lpc-manifest-data.js');
  fs.writeFileSync(
    jsOut,
    `/** Xerado por npm run sprites:lpc — non editar */\nexport const LPC_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`
  );

  fs.mkdirSync(path.join(ROOT, 'public', 'assets', 'sprites'), { recursive: true });
  for (const role of ['player', 'remote']) {
    const cid = config.roles[role];
    if (built[cid]) {
      fs.copyFileSync(
        path.join(OUT_CHAR_DIR, `${cid}.png`),
        path.join(ROOT, 'public', 'assets', 'sprites', `${role}.png`)
      );
    }
  }
  const botList = config.roles.bot || [];
  const npcList = config.roles.npc || [];
  if (built[botList[0]]) {
    fs.copyFileSync(
      path.join(OUT_CHAR_DIR, `${botList[0]}.png`),
      path.join(ROOT, 'public', 'assets', 'sprites', 'bot.png')
    );
  }
  if (built[npcList[0]]) {
    fs.copyFileSync(
      path.join(OUT_CHAR_DIR, `${npcList[0]}.png`),
      path.join(ROOT, 'public', 'assets', 'sprites', 'npc.png')
    );
  }

  const legacyFlat = OUT_ROOT;
  for (const id of Object.keys(built)) {
    const flat = path.join(legacyFlat, `${id}.png`);
    if (fs.existsSync(flat)) fs.unlinkSync(flat);
  }

  console.log(
    `\n✓ ${Object.keys(built).length} personaxes → public/assets/lpc/characters/\n` +
      `  manifest: public/assets/lpc/manifest.json`
  );
}

main();
