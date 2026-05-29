# Peleteiro — arte (Sprite Forge)

## Carpetas

| Ruta | Contido |
|------|---------|
| `source/{zona}/base-ground.png` | Mapa base **solo suelo** (Sprite Forge). Sustitúe o bake procedural. |
| `source/{zona}/props/` | Props transparentes extraídos (`generate2dsprite`) |
| `built/{zona}/base.png` | Capa base usada polo xogo (xerada ou importada) |
| `built/{zona}/manifest.json` | Posición de props por tile |

Zonas: `patio`, `floor-1` … `floor-4`

## Comandos

```bash
npm run forge:setup      # unha vez: Python + skills Cursor
npm run sprites:peleteiro
npm run forge:peleteiro  # bake built/ desde tileset ou importa source/
```

Guía de prompts: `docs/peleteiro-sprite-forge.md`
