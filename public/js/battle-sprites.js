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

export function getLpcBattlePortrait(lpcId, facing = 'down', displayPx = BATTLE_SPRITE_PX.enemy) {
  const manifest = getLpcManifest();
  const def = getCharacterDef(manifest, lpcId);
  if (!def?.path) return null;

  const scale = displayPx / FRAME;
  const dirs = LPC_WALK_DIRS;
  const frame = dirs[facing]?.start ?? dirs.down?.start ?? 18;
  const col = frame % 9;
  const row = Math.floor(frame / 9);
  const posX = -col * FRAME * scale;
  const posY = -row * FRAME * scale;

  return {
    url: def.path,
    posX,
    posY,
    bgW: SHEET_W * scale,
    bgH: SHEET_H * scale,
    displayPx,
  };
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
