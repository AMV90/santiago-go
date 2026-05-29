import { MOVES } from './moves.js';
import { THROW_ITEMS, rollThrowDamage } from './items.js';
import { gainXp, healPlayer, resetOnDeath, savePlayer, xpProgress } from './player-state.js';
import { inventoryList, removeItem, ensureInventory } from './inventory.js';
import { dogBattleAttack } from './dog-system.js';
import { renderBattleSprite, flashBattleAttack } from './battle-sprites.js';

let overlay = null;
let onBattleEnd = null;
let presentationTimer = null;
let presentationKeyHandler = null;

const PRESENTATION_MS = 3000;

export function initBattleUI() {
  overlay = document.getElementById('battle-overlay');
}

function clearPresentationListeners() {
  if (presentationTimer) {
    clearTimeout(presentationTimer);
    presentationTimer = null;
  }
  if (presentationKeyHandler) {
    window.removeEventListener('keydown', presentationKeyHandler);
    presentationKeyHandler = null;
  }
}

function hpBar(current, max, extraClass = '') {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const tone = pct > 50 ? 'hp-high' : pct > 20 ? 'hp-mid' : 'hp-low';
  return `<div class="hp-bar ${extraClass} ${tone}"><div class="hp-fill" style="width:${pct}%"></div></div>`;
}

function renderExpBar(player) {
  const xp = xpProgress(player);
  return `
    <div class="exp-row">
      <span class="exp-label">EXP</span>
      <div class="exp-bar"><div class="exp-fill" style="width:${xp.pct}%"></div></div>
    </div>`;
}

function renderHud(side, { name, level, hp, maxHp, showNumbers = false, player = null }) {
  const hpNums = showNumbers
    ? `<span class="hp-numbers">${hp}<span class="hp-sep">/</span>${maxHp}</span>`
    : '';
  const expRow = side === 'player' && player ? renderExpBar(player) : '';
  return `
    <div class="battle-hud ${side}-hud poke-box">
      <div class="hud-name-row">
        <strong class="hud-name">${name}</strong>
        <span class="hud-level">Nv${level}</span>
      </div>
      <div class="hp-row">
        <span class="hp-label">PS</span>
        ${hpBar(hp, maxHp, `${side}-hp`)}
        ${hpNums}
      </div>
      ${expRow}
    </div>`;
}

function factionClass(enemy) {
  if (enemy.faction === 'fontinas') return 'battle--bandit';
  if (enemy.faction === 'clergy') return 'battle--clergy';
  return 'battle--urban';
}

function presentationLine(enemy) {
  if (enemy.presentationLine) return enemy.presentationLine;
  if (enemy.faction === 'fontinas') {
    return `Un bandido das Fontiñas bloquea o camiño!`;
  }
  if (enemy.faction === 'clergy') {
    return `Un sacerdote da Catedral desafíate en combate!`;
  }
  return `Un rival xovem quere pelexar contigo!`;
}

function pickQuote(enemy) {
  if (enemy.battleQuote) return enemy.battleQuote;
  const quotes = [
    'Hoxe sangra a túa soberbia.',
    'Non pasas sen un bo golpe.',
    'A zona nova tamén é miña.',
    'Ti tamén es conflictivo? Perfecto.',
    'O Camiño tamén ten regras… ou non.',
  ];
  return quotes[String(enemy.name || '').length % quotes.length];
}

function renderArena(state) {
  const { player, enemy } = state;
  const playerHp = state.player.currentHp ?? player.hp;
  return `
    <div class="battle-field">
      ${renderHud('enemy', { name: enemy.name, level: enemy.level, hp: enemy.hp, maxHp: enemy.maxHp })}
      <div class="battle-char-slot enemy-slot">
        ${renderBattleSprite('enemy', { enemy })}
      </div>
      <div class="battle-char-slot player-slot">
        ${renderBattleSprite('player', { player })}
      </div>
      ${renderHud('player', {
        name: player.name,
        level: player.level,
        hp: playerHp,
        maxHp: player.maxHp,
        showNumbers: true,
        player: state.player,
      })}
    </div>`;
}

function menuBtn(label, action, mod = '', extraAttrs = '') {
  return `<button type="button" class="battle-menu-btn ${mod}" data-action="${action}" ${extraAttrs}>${label}</button>`;
}

function mainMenuHtml(state) {
  const items = inventoryList(state.player);
  const itemDisabled = items.length === 0 ? 'disabled' : '';
  return `
    <div class="battle-menu-bar">
      ${menuBtn('Pelexar', 'fight', 'battle-menu-btn--fight')}
      ${menuBtn('Obxecto', 'item', 'battle-menu-btn--item', itemDisabled)}
      ${menuBtn('Fuxir', 'flee', 'battle-menu-btn--flee')}
    </div>`;
}

function battleShell(state, { phase, consoleHtml, actionsHtml = '' }) {
  const { enemy } = state;
  return `
    <div class="battle-screen battle-phase-${phase} ${factionClass(enemy)}">
      ${renderArena(state)}
      <div class="battle-bottom">
        <div class="battle-console" id="battle-console">${consoleHtml}</div>
        <div class="battle-command-panel" id="battle-actions">${actionsHtml}</div>
      </div>
    </div>`;
}

function wireFlee(state, root = overlay) {
  root.querySelectorAll('[data-action="flee"]').forEach((btn) => {
    btn.onclick = () => endBattle(state, 'fled');
  });
}

function wireMainMenu(state) {
  const actions = document.getElementById('battle-actions');
  if (!actions) return;
  actions.querySelector('[data-action="fight"]').onclick = () => showMoveMenu(state);
  actions.querySelector('[data-action="flee"]').onclick = () => endBattle(state, 'fled');
  const itemBtn = actions.querySelector('[data-action="item"]');
  if (itemBtn && !itemBtn.disabled) itemBtn.onclick = () => showItemMenu(state);
  wireFlee(state);
}

export function startBattle({ player, enemy, onEnd }) {
  onBattleEnd = onEnd;
  ensureInventory(player);
  clearPresentationListeners();
  const state = {
    player,
    enemy: { ...enemy },
    phase: 'presentation',
    log: [],
    canAct: false,
  };
  state.player = { ...player, currentHp: player.hp };

  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('battle-open');
  renderPresentation(state);
}

function renderPresentation(state) {
  const { enemy } = state;
  const quote = pickQuote(enemy);
  const title =
    enemy.title ||
    (enemy.faction === 'fontinas'
      ? 'Bandido'
      : enemy.faction === 'clergy'
        ? 'Sacerdote'
        : 'Rival xovem');

  overlay.innerHTML = `
    <div class="battle-screen battle-phase-presentation ${factionClass(enemy)}" role="dialog" aria-label="Presentación do rival">
      <div class="battle-presentation-body" tabindex="0">
        <div class="presentation-flash">!</div>
        <div class="battle-field presentation-unified-field">
          <div class="battle-char-slot enemy-slot">
            ${renderBattleSprite('enemy', { enemy })}
          </div>
          <div class="presentation-dialog" aria-live="polite">
            <p class="presentation-line">${presentationLine(enemy)}</p>
            <p class="presentation-name">${enemy.name} <span class="presentation-lv">Nv${enemy.level}</span></p>
            <p class="presentation-role">${title}</p>
            <div class="presentation-quote-block">
              <p class="presentation-quote">«${quote}»</p>
            </div>
            <p class="presentation-hint">Enter · clic · ou agarda 3 s</p>
            <div class="presentation-timer" aria-hidden="true"><div class="presentation-timer-bar"></div></div>
          </div>
        </div>
      </div>
    </div>`;

  bindPresentationAdvance(state);
}

function bindPresentationAdvance(state) {
  const advance = () => {
    if (state.phase !== 'presentation') return;
    clearPresentationListeners();
    state.phase = 'fight';
    renderFight(state);
  };

  const stage = overlay.querySelector('.battle-presentation-body');
  stage?.addEventListener('click', advance, { once: true });

  presentationKeyHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advance();
    }
  };
  window.addEventListener('keydown', presentationKeyHandler);
  presentationTimer = setTimeout(advance, PRESENTATION_MS);
}

function renderFight(state) {
  const { player } = state;
  overlay.innerHTML = battleShell(state, {
    phase: 'fight',
    consoleHtml: renderLogHtml(state),
    actionsHtml: mainMenuHtml(state),
  });
  wireMainMenu(state);
}

function renderLogHtml(state) {
  const { player } = state;
  if (!state.log.length) {
    return `<p>Que debería facer <strong>${player.name}</strong>?</p>`;
  }
  const last = state.log[state.log.length - 1];
  return `<p>${last}</p>`;
}

function refreshConsole(state) {
  const el = document.getElementById('battle-console');
  if (el) el.innerHTML = renderLogHtml(state);
}

function showMainMenu(state) {
  const actions = document.getElementById('battle-actions');
  if (!actions) return;
  actions.innerHTML = mainMenuHtml(state);
  wireMainMenu(state);
}

function showItemMenu(state) {
  const items = inventoryList(state.player);
  const actions = document.getElementById('battle-actions');
  if (!items.length) {
    showMainMenu(state);
    return;
  }

  const buttons = items
    .map(
      (it) =>
        `<button type="button" class="battle-menu-btn battle-menu-btn--move move-btn" data-item="${it.id}">${it.name}<span class="pp">×${it.count}</span></button>`
    )
    .join('');

  actions.innerHTML = `
    <div class="battle-submenu">
      <p class="battle-submenu-title">Obxecto</p>
      <div class="battle-menu-moves">${buttons}</div>
      <div class="battle-submenu-footer">
        ${menuBtn('Fuxir', 'flee', 'battle-menu-btn--flee')}
        ${menuBtn('Volver', 'back', 'battle-menu-btn--ghost', 'id="battle-back"')}
      </div>
    </div>
  `;
  wireFlee(state);
  actions.querySelector('#battle-back').onclick = () => showMainMenu(state);
  actions.querySelectorAll('[data-item]').forEach((btn) => {
    btn.onclick = () => throwItemTurn(state, btn.dataset.item);
  });
}

function showMoveMenu(state) {
  const actions = document.getElementById('battle-actions');
  const buttons = state.player.moves
    .map((slot) => {
      const m = MOVES[slot.id];
      const disabled = slot.pp <= 0 ? 'disabled' : '';
      return `<button type="button" class="battle-menu-btn battle-menu-btn--move move-btn ${disabled}" data-move="${slot.id}" ${slot.pp <= 0 ? 'disabled' : ''}>
        ${m.name}<span class="pp">PP ${slot.pp}/${slot.maxPp}</span>
      </button>`;
    })
    .join('');

  actions.innerHTML = `
    <div class="battle-submenu">
      <p class="battle-submenu-title">Ataque</p>
      <div class="battle-menu-moves">${buttons}</div>
      <div class="battle-submenu-footer">
        ${menuBtn('Fuxir', 'flee', 'battle-menu-btn--flee')}
        ${menuBtn('Volver', 'back', 'battle-menu-btn--ghost', 'id="battle-back"')}
      </div>
    </div>
  `;
  wireFlee(state);
  actions.querySelector('#battle-back').onclick = () => showMainMenu(state);
  actions.querySelectorAll('[data-move]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.disabled) return;
      executeTurn(state, btn.dataset.move);
    };
  });
}

function throwItemTurn(state, itemId) {
  const item = THROW_ITEMS[itemId];
  if (!item || !removeItem(state.player, itemId)) {
    log(state, 'Non tes ese obxecto.');
    showMainMenu(state);
    return;
  }
  savePlayer(state.player);
  lockActions(true);

  if (Math.random() > item.accuracy) {
    log(state, `Lanzas ${item.name}… e falla!`);
  } else {
    const { dmg, crit } = rollThrowDamage(item, state.player.level, state.enemy.defense || 1);
    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    flashBattleAttack('player');
    log(
      state,
      crit
        ? `¡Crítico con ${item.name}! -${dmg} PS ao rival`
        : `${item.name} acerta: -${dmg} PS`
    );
  }

  updateFightHud(state);
  afterPlayerAction(state);
}

function executeTurn(state, moveId) {
  const slot = state.player.moves.find((m) => m.id === moveId);
  const move = MOVES[moveId];
  if (!slot || slot.pp <= 0) return;

  slot.pp -= 1;
  lockActions(true);

  if (move.effect === 'lowerDefense') {
    state.enemy.defense = (state.enemy.defense || 1) * 0.85;
    log(state, `Usaches ${move.name}. O rival está máis vulnerable.`);
  } else if (Math.random() > move.accuracy) {
    log(state, `${move.name} fallou!`);
  } else {
    const dmg = calcDamage(move.power, state.player.level, state.enemy.defense || 1);
    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    flashBattleAttack('player');
    log(state, `${move.name} inflixe ${dmg} de dano!`);
  }

  updateFightHud(state);
  afterPlayerAction(state);
}

function lockActions(locked) {
  const panel = document.getElementById('battle-actions');
  if (panel) panel.classList.toggle('battle-actions-locked', locked);
}

function afterPlayerAction(state) {
  if (state.enemy.hp <= 0) {
    setTimeout(() => endBattle(state, 'win'), 600);
    return;
  }

  const dogResult = dogBattleAttack(state.player, state.enemy);
  if (dogResult) {
    log(state, dogResult.msg);
    updateFightHud(state);
    if (state.enemy.hp <= 0) {
      setTimeout(() => endBattle(state, 'win'), 600);
      return;
    }
    setTimeout(() => enemyTurn(state), 750);
    return;
  }

  setTimeout(() => enemyTurn(state), 700);
}

function enemyTurn(state) {
  const pool = state.enemy.moves.filter((id) => MOVES[id]);
  const moveId = pool[Math.floor(Math.random() * pool.length)] || 'punetazo';
  const move = MOVES[moveId];

  if (Math.random() > move.accuracy) {
    log(state, `${state.enemy.name} fallou ${move.name}.`);
  } else if (move.effect === 'lowerDefense') {
    log(state, `${state.enemy.name} berra como un louco!`);
  } else {
    const dmg = calcDamage(move.power, state.enemy.level, 1);
    state.player.currentHp = Math.max(0, state.player.currentHp - dmg);
    flashBattleAttack('enemy');
    log(state, `${state.enemy.name} usa ${move.name}. -${dmg} PS`);
  }

  updateFightHud(state);

  if (state.player.currentHp <= 0) {
    setTimeout(() => endBattle(state, 'lose'), 600);
    return;
  }

  lockActions(false);
  showMainMenu(state);
}

function calcDamage(power, level, defenseMod = 1) {
  if (power <= 0) return 0;
  const base = ((2 * level) / 5 + 2) * power;
  const rand = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor((base / 10) * rand * defenseMod));
}

function log(state, msg) {
  state.log.push(msg);
  refreshConsole(state);
}

function updateFightHud(state) {
  const { player, enemy } = state;
  const enemyHud = overlay.querySelector('.enemy-hud');
  const playerHud = overlay.querySelector('.player-hud');
  if (enemyHud) {
    const pct = (enemy.hp / enemy.maxHp) * 100;
    const bar = enemyHud.querySelector('.hp-bar');
    const fill = enemyHud.querySelector('.hp-fill');
    fill.style.width = `${pct}%`;
    bar.className = `hp-bar enemy-hp ${hpToneClass(pct)}`;
  }
  if (playerHud) {
    const pct = (state.player.currentHp / player.maxHp) * 100;
    const bar = playerHud.querySelector('.hp-bar');
    const fill = playerHud.querySelector('.hp-fill');
    fill.style.width = `${pct}%`;
    bar.className = `hp-bar player-hp ${hpToneClass(pct)}`;
    const nums = playerHud.querySelector('.hp-numbers');
    if (nums) {
      nums.innerHTML = `${state.player.currentHp}<span class="hp-sep">/</span>${player.maxHp}`;
    }
    const expFill = playerHud.querySelector('.exp-fill');
    if (expFill) {
      const xp = xpProgress(state.player);
      expFill.style.width = `${xp.pct}%`;
    }
  }
}

function hpToneClass(pct) {
  if (pct > 50) return 'hp-high';
  if (pct > 20) return 'hp-mid';
  return 'hp-low';
}

function endBattle(state, result) {
  clearPresentationListeners();
  lockActions(false);
  let summary = '';
  let returnPlayer = state.player;
  let resultClass = '';

  if (result === 'win') {
    returnPlayer.stats.wins += 1;
    const xp = state.enemy.level * 28 + 12;
    const msgs = gainXp(returnPlayer, xp);
    summary = `Venceches! ${msgs.join(' ')}`;
    healPlayer(returnPlayer);
    returnPlayer.hp = returnPlayer.maxHp;
    resultClass = 'battle-result-win';
  } else if (result === 'lose') {
    returnPlayer = resetOnDeath();
    summary =
      'Morreches. Renaces na Catedral ao nivel 1. Perdes todo (obxectos e can).';
    result = 'death';
    resultClass = 'battle-result-lose';
  } else {
    returnPlayer.hp = Math.max(1, state.player.currentHp ?? state.player.hp);
    savePlayer(returnPlayer);
    summary = 'Escapaches da bronca. O rival queda coa súa pose.';
    resultClass = 'battle-result-fled';
  }

  overlay.innerHTML = `
    <div class="battle-screen battle-phase-result">
      <div class="battle-result ${resultClass}">
        <p>${summary}</p>
        <button type="button" class="battle-menu-btn battle-menu-btn--fight battle-menu-btn--wide" id="battle-close">Continuar</button>
      </div>
    </div>
  `;
  document.getElementById('battle-close').onclick = () => {
    overlay.classList.add('hidden');
    overlay.classList.remove('battle-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (onBattleEnd) onBattleEnd(result, returnPlayer);
    onBattleEnd = null;
  };
}

export function isBattleOpen() {
  return overlay && !overlay.classList.contains('hidden');
}
