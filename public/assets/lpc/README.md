# Sprites de personajes (LPC)

Sprites **incluidos en el repositorio** para que el juego funcione sin pasos extra de build.

## Estructura

```
lpc/
├── README.md           ← este archivo
├── CREDITS.md          ← licencias y atribución (obligatorio en producción)
├── manifest.json       ← índice para herramientas (generado con sprites:lpc)
└── characters/         ← hojas walk 576×256 (64×64 por frame, 4 direcciones)
    ├── player.png
    ├── remote.png
    ├── bot-0.png … bot-3.png
    ├── npc-0.png … npc-5.png
    ├── peleteiro-student.png
    ├── priest.png
    └── receptionist.png
```

El runtime carga rutas desde `public/js/lpc-manifest-data.js` (generado junto al manifest).

## Origen del arte

Compuestos a partir del [Universal LPC Spritesheet Character Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/) (Liberated Pixel Cup / OpenGameArt).

- **Capas por personaje (único):** `scripts/lpc/characters.json` → cada `id` es un aspecto distinto.
- **Arquetipos (pools reutilizables):** `scripts/lpc/archetypes.json` → `beggar`, `ghost`, `student`, `urban`, etc.
- **Runtime:** `public/js/character-catalog.js` + `public/js/battle-enemies.js` (instancias referencian `archetype` o `characterId` fijo).

## Regenerar (mantenedores)

```bash
npm run lpc:sync      # solo la primera vez: clona capas en .lpc-src/
npm run sprites:lpc   # recompone characters/*.png + manifest
```

Import manual desde el generador web: `assets/lpc/import/{id}.png` (ver `assets/lpc/import/README.md`).

## Compatibilidad legacy

`npm run sprites:lpc` también copia `player.png`, `bot.png`, `npc.png` y `remote.png` a `public/assets/sprites/` por si algún código antiguo los referencia.
