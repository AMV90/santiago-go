# Créditos — sprites LPC

Los PNG en `characters/` usan arte del ecosistema **Liberated Pixel Cup (LPC)** compuesto con el [Universal LPC Spritesheet Character Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/).

## Licencia

- Reglas habituales: **CC-BY-SA 3.0** y otras según cada capa.
- Debes **atribuir a los autores** de las capas usadas en tu juego (pantalla de créditos accesible).
- Repositorio fuente de capas: https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator  
- Listado completo de autores: `CREDITS.csv` en ese repositorio.

## Añadir / cambiar aspecto

1. Edita `scripts/lpc/characters.json` (lista de capas `walk.png` por personaje), **o**
2. Exporta un PNG completo desde el generador web y guárdalo en `assets/lpc/import/{id}.png`.
3. Ejecuta `npm run sprites:lpc` (salida en `characters/`).

Definiciones de personajes: `scripts/lpc/characters.json`.  
Documentación: `public/assets/lpc/README.md`.
