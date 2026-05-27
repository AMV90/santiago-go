/**
 * Sprites de combate (SVG estilo Pokémon).
 */

const BASE = 'assets/battle';

export function getEnemyBattleSpriteId(enemy) {
  if (enemy?.faction === 'clergy' || enemy?.sprite === 'priest') return 'enemy-priest';
  if (enemy?.faction === 'fontinas') return 'enemy-bandit';
  const m = String(enemy?.sprite || '').match(/npc-(\d+)/);
  if (m) return `enemy-${Number(m[1]) % 6}`;
  return 'enemy-0';
}

export function renderBattleSprite(role, context = {}) {
  const isPlayer = role === 'player';
  const id = isPlayer ? 'player' : getEnemyBattleSpriteId(context.enemy);
  const sideClass = isPlayer ? 'battle-char-player' : 'battle-char-enemy';
  const alt = isPlayer
    ? context.player?.name || 'Xogador'
    : context.enemy?.name || 'Rival';

  return `
    <div class="battle-char ${sideClass}" data-sprite="${id}">
      <img class="battle-char-img" src="${BASE}/${id}.svg" alt="${alt}" width="96" height="96" draggable="false" />
      <div class="battle-char-shadow"></div>
    </div>`;
}

export function flashBattleAttack(role) {
  const sel =
    role === 'player'
      ? '.battle-char-player .battle-char-img'
      : '.battle-char-enemy .battle-char-img';
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.remove('battle-attack-flash');
  void el.offsetWidth;
  el.classList.add('battle-attack-flash');
}
