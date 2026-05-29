/**
 * Layout walk 576×256 do Universal LPC Spritesheet Generator.
 * @see https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/
 */

export const LPC_FRAME_W = 64;
export const LPC_FRAME_H = 64;

/**
 * Filas do walk.png ULPC (576×256): norte, oeste, sur, leste (9 cols × 4 filas).
 * Usamos 8 frames por fila (columnas 0–7).
 */
export const LPC_WALK_DIRS = {
  up: { start: 0, end: 7 },
  left: { start: 9, end: 16 },
  down: { start: 18, end: 25 },
  right: { start: 27, end: 34 },
};

export function lpcWalkDirection(dx, dy) {
  if (Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}
