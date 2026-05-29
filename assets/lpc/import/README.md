# Importación manual LPC

Coloca aquí PNG exportados del [generador LPC](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/) con el nombre `{id}.png` (mismo `id` que en `scripts/lpc/characters.json`).

Ejemplo: `assets/lpc/import/custom-npc.png` → tras `npm run sprites:lpc` aparece en `public/assets/lpc/characters/custom-npc.png`.

**Recomendado:** exportar también el JSON del generador y guardarlo junto al PNG para recuperar créditos de autores.

Esta carpeta no se sirve al navegador; solo al script de build.
