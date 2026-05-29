/**
 * Retratos de combate — mesmo spritesheet LPC que no mapa.
 * O tamaño de visualización debe coincidir co background-size/position.
 */
import { LPC_WALK_DIRS } from './lpc-layout.js';
import { getCharacterDef, getLpcManifest } from './lpc-sprites.js';
import { resolveBattleCharacterId } from './character-catalog.js';

const SHEET_W = 576;
const SHEET_H = 256;
const FRAME = 64;

/** Tamaño en pantalla (px) — igual en presentación e no campo de combate. */
export const BATTLE_SPRITE_PX = {
  player: 100,
  enemy: 96,
};

/** Xogador mira á dereita; rival mira á esquerda (de fronte). */
const BATTLE_FACING = {
  player: 'right',
  enemy: 'left',
};

/** Punto de enfoque dentro do frame 64×64 (0–1). */
const PORTRAIT_FOCUS = {
  right: { x: 0.54, y: 0.42 },
  left: { x: 0.46, y: 0.42 },
  down: { x: 0.5, y: 0.4 },
  up: { x: 0.5, y: 0.58 },
};

export function getLpcBattlePortrait(lpcId, facing = 'down', displayPx = BATTLE_SPRITE_PX.enemy, options = {}) {
  const manifest = getLpcManifest();
  const def = getCharacterDef(manifest, lpcId);
  if (!def?.path) return null;

  const zoom = options.zoom ?? 1;
  const scale = (displayPx / FRAME) * zoom;
  const dirs = LPC_WALK_DIRS;
  const frame = dirs[facing]?.start ?? dirs.down?.start ?? 18;
  const col = frame % 9;
  const row = Math.floor(frame / 9);
  const focus = options.focus ?? PORTRAIT_FOCUS[facing] ?? PORTRAIT_FOCUS.down;
  const focusX = col * FRAME + FRAME * focus.x;
  const focusY = row * FRAME + FRAME * focus.y;
  const posX = displayPx / 2 - focusX * scale;
  const posY = displayPx / 2 - focusY * scale;

  return {
    url: def.path,
    posX,
    posY,
    bgW: SHEET_W * scale,
    bgH: SHEET_H * scale,
    displayPx,
  };
}

/** Retrato pequeno do HUD (barra PS) — zoom á cara. */
export function getLpcHudPortrait(lpcId = 'player', displayPx = 40) {
  return getLpcBattlePortrait(lpcId, 'right', displayPx, {
    zoom: 1.85,
    focus: { x: 0.52, y: 0.3 },
  });
}

export function renderBattleSprite(role, context = {}) {
  const isPlayer = role === 'player';
  const lpcId = resolveBattleCharacterId(isPlayer ? context.player : context.enemy, role);
  const facing = BATTLE_FACING[role] || 'down';
  const displayPx = context.displayPx ?? BATTLE_SPRITE_PX[role] ?? BATTLE_SPRITE_PX.enemy;
  const portrait = getLpcBattlePortrait(lpcId, facing, displayPx);
  const sideClass = isPlayer ? 'battle-char-player' : 'battle-char-enemy';
  const alt = isPlayer
    ? context.player?.name || 'Xogador'
    : context.enemy?.name || 'Rival';

  if (!portrait) {
    return `<div class="battle-char ${sideClass}" data-lpc="${lpcId}"><div class="battle-lpc-clip" style="width:${displayPx}px;height:${displayPx}px"><div class="battle-lpc-portrait battle-lpc-missing" title="${alt}">?</div></div></div>`;
  }

  return `
    <div class="battle-char ${sideClass}" data-lpc="${lpcId}">
      <div class="battle-lpc-clip" style="width:${displayPx}px;height:${displayPx}px">
        <div
          class="battle-lpc-portrait"
          role="img"
          aria-label="${alt}"
          style="
            width:${displayPx}px;
            height:${displayPx}px;
            background-image:url('${portrait.url}');
            background-position:${portrait.posX}px ${portrait.posY}px;
            background-size:${portrait.bgW}px ${portrait.bgH}px;
          "
        ></div>
      </div>
      <div class="battle-char-shadow"></div>
    </div>`;
}

export function flashBattleAttack(role) {
  const sel = role === 'player' ? '.battle-char-player' : '.battle-char-enemy';
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.remove('battle-attack-flash');
  void el.offsetWidth;
  el.classList.add('battle-attack-flash');
}
