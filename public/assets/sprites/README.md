# Sprites de personaje (copias legacy)

Esta carpeta contiene **copias de compatibilidad** de los roles principales (`player`, `bot`, `npc`, `remote`).

## Fuente canónica

Los sprites LPC completos (15 personajes, 64×64, 4 direcciones) están en:

**`public/assets/lpc/characters/`**

Ver `public/assets/lpc/README.md` y `public/assets/lpc/CREDITS.md`.

## Regenerar

```bash
npm run sprites:lpc
```

Actualiza `lpc/characters/` y refresca estos cuatro PNG.

## Fallback procedural

Si faltan PNG LPC, el juego usa texturas generadas en código (`sprites.js` → `createFallbackTextures`).

El comando `npm run sprites` genera PNG 16×24 de ejemplo (formato antiguo); el proyecto usa LPC por defecto.
