/**
 * Expande characters.json con 220+ variantes LPC (bots, NPCs, esqueletos, espectros).
 * Uso: node scripts/lpc/expand-lpc-roster.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BODIES, comboForBody, botProfile, skeletonLayers, specterLayers } from './roster-pools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const BASE_PATH = path.join(__dirname, 'characters.base.json');
const OUT_PATH = path.join(__dirname, 'characters.json');
const SOURCES = path.join(ROOT, '.lpc-src', 'spritesheets');

function existsLayer(rel) {
  return fs.existsSync(path.join(SOURCES, rel.replace(/\//g, path.sep)));
}

function filterLayers(layers) {
  return layers.filter((l) => existsLayer(l));
}

function hashScale(id, base = 0.46) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return base + (Math.abs(h) % 9) * 0.004;
}

function addChar(chars, id, layers, extra = {}) {
  const ok = filterLayers(layers);
  if (!ok.length) return false;
  if (ok.length < 2 && !extra.singleLayer) return false;
  chars[id] = { scale: hashScale(id, extra.scale ?? 0.48), layers: ok, ...extra };
  return true;
}

function main() {
  if (!fs.existsSync(BASE_PATH)) {
    console.error('Falta scripts/lpc/characters.base.json');
    process.exit(1);
  }
  const base = JSON.parse(fs.readFileSync(BASE_PATH, 'utf8'));
  const chars = { ...base.characters };
  let added = 0;

  const bodyKeys = ['male', 'female', 'teen', 'muscular'];
  let hairIdx = 0;
  const personalityMap = {};
  let botsUpdated = 0;

  for (let i = 0; i < 104; i++) {
    const id = `bot-${i}`;
    const profile = botProfile(i);
    personalityMap[id] = profile.personalityId;
    if (
      addChar(chars, id, profile.layers, {
        label: profile.label,
        personalityId: profile.personalityId,
        tint: profile.tint,
      })
    ) {
      botsUpdated++;
    }
  }

  for (let i = 6; i < 126; i++) {
    const id = `npc-${i}`;
    if (chars[id]) continue;
    const bodyKey = bodyKeys[(i + 1) % bodyKeys.length];
    if (addChar(chars, id, comboForBody(bodyKey, hairIdx++, i + 3), { label: `Rival ${i}` })) added++;
  }

  for (let i = 10; i < 60; i++) {
    const id = `urban-${i}`;
    if (chars[id]) continue;
    const bodyKey = bodyKeys[i % bodyKeys.length];
    if (addChar(chars, id, comboForBody(bodyKey, hairIdx++, i))) added++;
  }

  for (let i = 0; i < 30; i++) {
    const id = `school-${i}`;
    if (chars[id]) continue;
    const bodyKey = i % 3 === 0 ? 'teen' : i % 2 ? 'female' : 'male';
    if (addChar(chars, id, comboForBody(bodyKey, hairIdx++, i), { label: `Alumno ${i}` })) added++;
  }

  for (let i = 0; i < 24; i++) {
    const id = `skeleton-${i}`;
    if (chars[id]) continue;
    if (
      addChar(chars, id, skeletonLayers(i), {
        label: `Esqueleto ${i}`,
        tint: 0xc8e0f0,
        archetype: 'skeleton',
      })
    ) {
      added++;
    }
  }

  for (let i = 0; i < 24; i++) {
    const id = `specter-${i}`;
    if (chars[id]) continue;
    if (
      addChar(chars, id, specterLayers(i), {
        label: `Espectro ${i}`,
        tint: 0x99ddff,
        archetype: 'specter',
      })
    ) {
      added++;
    }
  }

  const botRoles = [];
  const npcRoles = [];
  for (const id of Object.keys(chars).sort()) {
    if (id.startsWith('bot-')) botRoles.push(id);
    if (id.startsWith('npc-') || id.startsWith('urban-')) npcRoles.push(id);
  }

  const roles = {
    ...base.roles,
    bot: botRoles,
    npc: npcRoles,
  };

  const out = {
    ...base,
    characters: chars,
    roles,
    $generated: {
      at: new Date().toISOString(),
      added,
      total: Object.keys(chars).length,
    },
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const mapOut = path.join(ROOT, 'public', 'js', 'bot-personality-map.js');
  fs.writeFileSync(
    mapOut,
    `/** Xerado por npm run sprites:lpc — non editar */\nexport const BOT_PERSONALITY_MAP = ${JSON.stringify(personalityMap, null, 2)};\n`
  );

  console.log(`✓ Roster LPC: +${added} novos, ${Object.keys(chars).length} total`);
  console.log(`  bots: ${botRoles.length} (${botsUpdated} perfiles) · npc/urban: ${npcRoles.length}`);
}

main();
