# Guía rápida — generadores de sprites (Santiago Go)

**Para sesiones de IA:** lee esto junto con `docs/CONTEXTO-PROYECTO.md` cuando el usuario pida NPCs, personajes, combate, interiores o assets nuevos.

Hay **tres pipelines** distintos. No mezclarlos sin motivo.

| Pipeline | Cuándo usarlo | Salida en el juego |
|----------|---------------|-------------------|
| **Universal LPC** (capas) | Humanos, esqueletos, rivales, bots, escuela, cripta | `public/assets/lpc/characters/*.png` |
| **Sprite Forge — `generate2dsprite`** | Criaturas, FX, props animados, héroes IA | PNG + GIF + frames en carpeta de run |
| **Sprite Forge — `generate2dmap`** | Bases de interiores, props de mapa, tilesets IA | `public/assets/interiors/...` (ver Peleteiro) |

---

## 1. Universal LPC (el que funciona de verdad para NPCs)

**Repo clonado:** `.lpc-src/` (sparse checkout)  
**Generador web:** https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/  
**Licencia:** CC-BY-SA 3.0 — ver `assets/lpc/CREDITS.md`

### Comandos

```bash
npm run lpc:sync          # clona capas si falta .lpc-src
npm run sprites:lpc       # expande roster + compone PNGs + manifest
npm run play              # recompila LPC si cambian scripts/config
```

### Formato walk del juego

- Hoja **576×256**, frames **64×64**
- Filas: **arriba · izquierda · abajo · derecha** (8 frames usados por fila)
- Definido en `scripts/build-lpc-sprites.mjs` (`WALK_DIRS`)

### Cómo se compone un personaje

1. **Capas** `walk.png` apiladas en orden (piernas → torso → cuerpo → cabeza → pelo…)
2. Script `scripts/lpc/composite-walk.mjs` las fusiona
3. Config en `scripts/lpc/characters.base.json` + expansión automática en `characters.json`

**Import manual:** PNG completo en `assets/lpc/import/{id}.png` → tiene prioridad sobre capas.

### Explorar qué hay en `.lpc-src`

```powershell
# Cuerpos disponibles
dir .lpc-src\spritesheets\body\bodies

# Cabezas (human, skeleton, zombie, orc, vampire, jack…)
dir .lpc-src\spritesheets\head\heads

# Ropa, piernas, pies, pelo…
dir .lpc-src\spritesheets\torso\clothes
dir .lpc-src\spritesheets\legs
dir .lpc-src\spritesheets\feet
dir .lpc-src\spritesheets\hair
```

**Inventario típico (sparse):** 8 cuerpos, 20 cabezas, 12 tipos de ropa torso, 87 peinados.

### Rutas — ojo con las excepciones

La mayoría de capas usan `…/walk.png`. Algunas (esqueleto, etc.) usan subcarpeta:

| Capa | Ruta correcta |
|------|----------------|
| Cuerpo male | `body/bodies/male/walk.png` |
| Cuerpo skeleton | `body/bodies/skeleton/walk/skeleton.png` |
| Cabeza skeleton | `head/heads/skeleton/walk/skeleton.png` |
| Cabeza skeleton adult | `head/heads/skeleton/adult/walk/skeleton.png` |
| Túnica (ej. púrpura) | `torso/clothes/robe/female/walk/purple.png` |

**Regla:** antes de registrar una capa, comprobar con `Test-Path` o `existsLayer()` en `expand-lpc-roster.mjs`.

### Añadir variantes (ej. esqueletos)

Editar **`scripts/lpc/roster-pools.mjs`**:

```javascript
export function skeletonLayers(variant = 0) {
  const layers = [BODIES.skeleton];
  // túnica, cinturón… según variant
  layers.push(SKELETON_ROBES[variant % SKELETON_ROBES.length]);
  layers.push(variant % 3 === 0 ? HEADS.skeletonAdult : HEADS.skeleton);
  return layers;
}
```

Luego en **`scripts/lpc/expand-lpc-roster.mjs`** se generan `skeleton-0…23`.

### Arquetipos y pools (quién sale dónde)

- **`scripts/lpc/archetypes.json`** — pools por rol (`skeleton`, `specter`, `student`…)
- **`public/js/character-catalog.js`** — elige ID determinista del pool
- **`public/js/interiors/peleteiro-npcs.js`** — `archetype: 'skeleton'` en 3ª planta

### ❌ No hacer con LPC

- No pintar esqueletos a mano si existen capas LPC
- No usar `body/bodies/skeleton/walk.png` (no existe)
- No poner pelo/cabeza humana encima de cuerpo skeleton sin probar composición

### ✅ Caso de éxito: esqueletos Peleteiro

`skeleton-0…23` = cuerpo LPC + calavera + túnica/cinturón opcional. Ver `roster-pools.mjs` → `skeletonLayers()`.

---

## 2. Sprite Forge — personajes y FX (`generate2dsprite`)

**Repo:** `tools/agent-sprite-forge` (`npm run forge:setup` una vez)  
**Skill:** `tools/agent-sprite-forge/skills/generate2dsprite/SKILL.md`  
**Modos detallados:** `…/references/modes.md`

### Flujo estándar

1. **IA genera** PNG raw con fondo **magenta sólido `#FF00FF`** (contrato del processor)
2. **Python postprocesa** — quita magenta, parte frames, alinea, exporta GIF

```bash
python tools/agent-sprite-forge/skills/generate2dsprite/scripts/generate2dsprite.py list-options

python tools/agent-sprite-forge/skills/generate2dsprite/scripts/generate2dsprite.py process ^
  --input ruta/raw.png ^
  --target npc ^
  --mode walk ^
  --output-dir assets/mi-run ^
  --rows 2 --cols 2 --cell-size 128
```

### Targets y modos (explorar con `list-options`)

| Target | Modos principales | Uso |
|--------|-------------------|-----|
| **`npc`** | `npc`, `npc_walk` | NPCs overworld top-down |
| **`player`** | `player`, `player_walk`, `player_sheet`, `player_actions` | Héroe jugable |
| **`creature`** | `single`, `evolution`, `idle`, `combat`, `walk`, `actions` | Monstruos, jefes |
| **`asset`** | `idle`, `cast`, `attack`, `hurt`, `walk`, `run`, `projectile`, `impact`, `explode`, `death`, `fx`, `sheet`… | FX, proyectiles, VFX |

### Grids por defecto (`grid_shapes`)

| Modo | Grid | Frames |
|------|------|--------|
| `idle`, `walk`, `attack`, `hurt`, `combat` | 2×2 | 4 |
| `cast`, `death` | 2×3 | 6 |
| `projectile` | 1×4 | 4 |
| **`player_sheet`** | **4×4** | 16 (4 dirs × 4 frames) |

### Roles NPC (prompt)

`starter`, `shop`, `healer`, `summoner`, `sage`, `trainer`, `gym_leader`, `villager`, `guard`

### Bundles (planificación)

- `single_asset` — un sprite o hoja
- `unit_bundle` — idle + combat (+ walk opcional)
- `spell_bundle` — cast + projectile + impact
- `combat_bundle` — idle + attack + hurt
- `hero_action_bundle` — idle/run/attack/jump **por hoja separada** (no mezclar acciones en un raw)
- `line_bundle` — línea evolutiva (1–3 formas)

### Parámetros útiles del processor

| Flag | Valores | Cuándo |
|------|---------|--------|
| `--align` | `center`, `bottom`, `feet` | Personajes en suelo → `feet` |
| `--component-mode` | `all`, `largest` | Cuerpo héroe → `largest`; FX sueltos → `all` |
| `--shared-scale` | flag | Misma escala en todos los frames |
| `--reject-edge-touch` | flag | Rechazar si toca borde de celda |

### Salida típica de `process`

- `raw-sheet.png`, `raw-sheet-clean.png`, `sheet-transparent.png`
- `walk-1.png` … (frames sueltos)
- `animation.gif`
- `pipeline-meta.json` (QC: edge_touch, crop_bbox…)
- Si `player_sheet`: además `down-strip.png`, `left-strip.png`, GIFs por dirección

### Integrar en Santiago Go

- **NPC overworld LPC:** convertir/adaptar a hoja **576×256** o usar como `assets/lpc/import/{id}.png` si el layout coincide
- **Combate / FX:** `public/js/battle-sprites.js`, assets en `public/assets/…`
- **No sustituir LPC humano** por Forge salvo petición explícita

### ❌ No hacer con Forge

- No dibujar sprites procedurales en Node/Python como “Forge” (el skill exige `image_gen` para el raw)
- No mezclar idle+run+attack en un solo raw 4×4 para héroes
- No usar filas 1×N para personajes (deriva horizontal)

---

## 3. Sprite Forge — mapas e interiores (`generate2dmap`)

**Skill:** `tools/agent-sprite-forge/skills/generate2dmap/SKILL.md`  
**Peleteiro en este proyecto:** `docs/peleteiro-sprite-forge.md`

### Map modes

| Modo | Para qué |
|------|----------|
| `tile_mode` | RPG top-down, rutas, ciudades |
| `scene_mode` | Arena + props separados (Peleteiro) |
| `side_scroll_mode` | Plataformas, parallax |
| `grid_mode` | Táctico, factory |
| `room_chunk_mode` | Salas modulares |
| `baked_scene_mode` | Fondo fijo (combate, menú) |

### Contrato Peleteiro (scene_mode)

- **Solo terreno** en `base-ground.png` / bases HD
- **Mobiliario** en props tileset (`peleteiro-bake.mjs`)
- Bases procedurales actuales: `scripts/interiors/paint-peleteiro-hd-bases.mjs`
- `npm run play` regenera tileset + bases + bake

---

## 4. Mapa de archivos del proyecto

```
scripts/lpc/
  roster-pools.mjs      ← capas LPC por arquetipo (skeletonLayers, comboForBody…)
  expand-lpc-roster.mjs ← genera skeleton-0…23, bot-*, npc-*…
  characters.base.json  ← personajes fijos + metadatos
  characters.json       ← generado (no editar a mano)
  archetypes.json       ← pools skeleton, specter, student…
  composite-walk.mjs    ← fusiona capas 576×256

scripts/build-lpc-sprites.mjs  ← compone → public/assets/lpc/
scripts/lpc-sync.mjs             ← clone sparse Universal LPC

public/js/character-catalog.js   ← pickCharacterId(archetype)
public/js/lpc-sprites.js         ← carga manifest en Phaser
public/assets/lpc/manifest.json  ← generado

tools/agent-sprite-forge/skills/
  generate2dsprite/     ← NPCs/criaturas/FX IA
  generate2dmap/        ← mapas/props IA
```

---

## 5. Árbol de decisión (IA)

```
¿Personaje humanoide / escolar / esqueleto LPC / bot callejero?
  → Universal LPC (capas en roster-pools.mjs)
  → npm run sprites:lpc

¿Monstruo único, jefe, proyectil, explosión, criatura original?
  → generate2dsprite (IA + process)
  → integrar en combate o import/

¿Suelo, pared, mueble, interior, tileset?
  → generate2dmap o paint-peleteiro-hd-bases.mjs
  → docs/peleteiro-sprite-forge.md
```

---

## 6. Checklist al resetear consola

1. Leer `docs/CONTEXTO-PROYECTO.md` + **este archivo**
2. `Test-Path .lpc-src` → si falta: `npm run lpc:sync`
3. Para NPCs: explorar capas en `.lpc-src/spritesheets/` antes de inventar arte
4. Verificar rutas `walk.png` vs `walk/nombre.png`
5. `npm run sprites:lpc` tras cambiar `roster-pools` o `characters.base.json`
6. Probar in-game: `npm run play` → http://localhost:3000
7. Sprite Forge: `list-options` + leer `modes.md` antes de generar
8. Peleteiro 3ª planta: arquetipo `skeleton` / `specter` en `peleteiro-npcs.js`

---

## 7. Referencias externas

- Universal LPC Generator: https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/
- Repo LPC: https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator
- agent-sprite-forge: https://github.com/0x0funky/agent-sprite-forge

---

*Última actualización: esqueletos LPC compuestos (cuerpo + calavera + túnica), eliminados sprites procedurales forge.*
