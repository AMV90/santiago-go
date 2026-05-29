# Peleteiro × Sprite Forge

## Xogar

```bash
npm run play
```

Reconstrúe tileset, bases (`forge-peleteiro-layout-bases.mjs`) e props (`peleteiro-bake.mjs`).

## Distribución (3 plantas)

| Planta | Deseño |
|--------|--------|
| **1º** | Pasillo horizontal central + **biblioteca** (oeste) + aulas con porta ao pasillo |
| **2º** | **A planta é o pasillo** (amplo); aulas pequenas ao norte/sur |
| **3º** | **Pasillo vertical** con **ventanas** (`x`) ao oeste; aulas á dereita; esqueletos/espectros |

Escaleiras: **W** ou **↑** na tile `u` (norte); **S** ou **↓** na tile `v` (sur).

## Sprite Forge (`tools/agent-sprite-forge`)

As bases seguen o contrato **scene_mode / layered**: só terreno en `base-ground.png`; mobiliario en props (tileset).

- Xerador: `scripts/interiors/forge-peleteiro-layout-bases.mjs` (lê o layout ASCII)
- Metadatos: `public/assets/interiors/peleteiro/source/{zona}/forge-meta.json`
- Para arte IA final: skill `$generate2dmap` → gardar PNG en `source/{zona}/base-ground.png` → `npm run play`

Repo: https://github.com/0x0funky/agent-sprite-forge — `npm run forge:setup` unha vez.

Guía completa de modos (LPC + Forge): **`docs/GUIA-GENERADORES-SPRITES.md`**
