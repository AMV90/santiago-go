import { NPC_ENCOUNTER_RANGE } from '../config.js';
import { MOVES } from '../moves.js';
import { startBattle } from '../battle-ui.js';
import { savePlayer, healPlayer } from '../player-state.js';
import { applyCharacterSprite } from '../sprites.js';
import { showChatBubble } from '../chat-bubbles.js';
import { resetMovementState } from '../movement-controller.js';
import { clearNavigation } from '../path-navigation.js';

const TEXTURE_CACHE = new Map();

function ensureTexture(scene, key, drawFn) {
  if (scene.textures.exists(key)) return;
  if (TEXTURE_CACHE.has(key)) {
    TEXTURE_CACHE.get(key)(scene);
    return;
  }
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g);
  g.generateTexture(key, 16, 24);
  g.destroy();
}

function loadDefeated(storageKey) {
  if (!storageKey) return [];
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function markDefeated(storageKey, id) {
  if (!storageKey) return;
  const ids = loadDefeated(storageKey);
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(storageKey, JSON.stringify(ids));
  }
}

function unmarkDefeated(storageKey, id) {
  if (!storageKey) return;
  const ids = loadDefeated(storageKey).filter((x) => x !== id);
  if (ids.length) localStorage.setItem(storageKey, JSON.stringify(ids));
  else localStorage.removeItem(storageKey);
}

function pickInteriorRespawnTile(layout, awayX, awayY, minDistPx = 96) {
  const candidates = [];
  const minDist2 = minDistPx * minDistPx;

  for (let ty = 0; ty < layout.rows.length; ty++) {
    const row = layout.rows[ty];
    for (let tx = 0; tx < row.length; tx++) {
      const ch = layout.getTileAt(tx, ty);
      if (layout.isBlocked(ch) || ch === 'D') continue;
      const pos = layout.tileToWorld(tx, ty);
      const dx = pos.x - awayX;
      const dy = pos.y - awayY;
      if (dx * dx + dy * dy < minDist2) continue;
      candidates.push({ tx, ty, x: pos.x, y: pos.y });
    }
  }

  if (!candidates.length) {
    for (let ty = 0; ty < layout.rows.length; ty++) {
      const row = layout.rows[ty];
      for (let tx = 0; tx < row.length; tx++) {
        const ch = layout.getTileAt(tx, ty);
        if (layout.isBlocked(ch) || ch === 'D') continue;
        const pos = layout.tileToWorld(tx, ty);
        candidates.push({ tx, ty, x: pos.x, y: pos.y });
      }
    }
  }

  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function spawnInteriorBattleSprite(scene, battleCfg, npc, actorState) {
  const textureKey = battleCfg.texture?.key || 'char-npc';
  const spr = scene.add.sprite(npc.x, npc.y, textureKey);
  if (!battleCfg.texture && battleCfg.spriteRole) {
    applyCharacterSprite(spr, battleCfg.spriteRole, scene, battleCfg.spriteVariant ?? 0);
  }
  if (battleCfg.tint) spr.setTint(battleCfg.tint);
  spr.setDepth(22);
  spr.setData('npc', npc);
  spr.setData('interiorNpc', true);

  if (battleCfg.tag) {
    const tag = scene.add.text(npc.x, npc.y - 20, battleCfg.tag(npc), {
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(40, 40, 60, 0.9)',
      padding: { x: 4, y: 2 },
    });
    tag.setOrigin(0.5, 1);
    tag.setDepth(23);
    spr.setData('actorTag', tag);
  }

  actorState.battleSprites.push(spr);
  scene._interiorBattleSprites = actorState.battleSprites;
  return spr;
}

function respawnInteriorBattleNpc(scene, layout, battleCfg, actorState, defeatedNpc, spr, showToast) {
  const tile = pickInteriorRespawnTile(layout, spr.x, spr.y);
  if (!tile) return null;

  const newNpc = {
    ...defeatedNpc,
    id: `${defeatedNpc.id.split('-r')[0]}-r${Date.now()}`,
    tx: tile.tx,
    ty: tile.ty,
    x: tile.x,
    y: tile.y,
    defeated: false,
  };

  const idx = actorState.battleNpcs.findIndex((n) => n.id === defeatedNpc.id);
  if (idx >= 0) actorState.battleNpcs[idx] = newNpc;
  else actorState.battleNpcs.push(newNpc);

  unmarkDefeated(battleCfg.storageKey, defeatedNpc.id);
  spawnInteriorBattleSprite(scene, battleCfg, newNpc, actorState);
  showToast?.(
    `${newNpc.name} (nv. ${newNpc.level}) volveu aparecer noutro punto.`
  );
  return newNpc;
}

function defaultBattleEnemy(npc) {
  const level = npc.level || 1;
  const movePool = ['cabezazo', 'golpe_bajo', 'grito', 'insulto', 'patada', 'punetazo'];
  return {
    name: npc.name,
    title: npc.title,
    level,
    hp: 16 + level * 7,
    maxHp: 16 + level * 7,
    moves: movePool.filter((id) => MOVES[id]).slice(0, 4),
    sprite: npc.sprite || 'npc-0',
    faction: npc.faction || 'urban',
    battleQuote: npc.battleQuote,
    presentationLine: npc.presentationLine,
  };
}

/**
 * Crea runtime de actores para unha instancia (combate + ambientación).
 */
export function createInteriorActors(placeId, layout, actorsDef) {
  const battleCfg = actorsDef?.battle;
  const chatterCfg = actorsDef?.chatter;
  const receptionistCfg = actorsDef?.receptionist;

  const state = {
    battleSprites: [],
    battleNpcs: [],
    chatterItems: [],
    receptionist: null,
  };

  function resolveNpcPositions(npcs) {
    return npcs.map((n) => ({
      ...n,
      x: n.x ?? layout.tileToWorld(n.tx, n.ty).x,
      y: n.y ?? layout.tileToWorld(n.tx, n.ty).y,
      defeated: n.defeated ?? loadDefeated(battleCfg?.storageKey).includes(n.id),
    }));
  }

  function enter(scene) {
    if (battleCfg?.texture) {
      ensureTexture(scene, battleCfg.texture.key, battleCfg.texture.draw);
    }

    if (battleCfg?.npcs?.length) {
      state.battleNpcs = resolveNpcPositions(battleCfg.npcs);
      const pendingRespawn = state.battleNpcs.filter((n) => n.defeated);
      state.battleNpcs = state.battleNpcs.filter((n) => !n.defeated);

      for (const npc of state.battleNpcs) {
        spawnInteriorBattleSprite(scene, battleCfg, npc, state);
      }

      for (const old of pendingRespawn) {
        unmarkDefeated(battleCfg.storageKey, old.id);
        respawnInteriorBattleNpc(
          scene,
          layout,
          battleCfg,
          state,
          old,
          { x: old.x, y: old.y },
          null
        );
      }

      scene._interiorBattleSprites = state.battleSprites;
    }

    if (chatterCfg?.patrons?.length) {
      const interval = chatterCfg.intervalMs ?? 9000;
      chatterCfg.patrons.forEach((def, i) => {
        const pos = layout.tileToWorld(def.tx, def.ty);
        const spr = scene.add.sprite(pos.x, pos.y, chatterCfg.spriteKey || 'char-bot');
        applyCharacterSprite(spr, chatterCfg.spriteRole || 'bot', scene, i % 6);
        if (def.tint != null) spr.setTint(def.tint);
        else if (chatterCfg.tint) spr.setTint(chatterCfg.tint);
        spr.setDepth(22);
        spr.setData('patron', def);

        let tagEl = null;
        if (def.emoji || chatterCfg.defaultEmoji) {
          tagEl = scene.add.text(pos.x, pos.y - 14, def.emoji || chatterCfg.defaultEmoji, {
            fontSize: '11px',
          });
          tagEl.setOrigin(0.5, 1);
          tagEl.setDepth(23);
          spr.setData('actorTag', tagEl);
        }

        state.chatterItems.push({
          spr,
          def,
          nextChat: performance.now() + 2000 + i * 600,
          interval,
        });
      });
    }

    if (receptionistCfg) {
      ensureTexture(scene, 'char-receptionist', drawReceptionistTexture);
      const pos = layout.tileToWorld(receptionistCfg.tx, receptionistCfg.ty);
      const spr = scene.add.sprite(pos.x, pos.y, 'char-receptionist');
      spr.setDepth(22);
      spr.setData('receptionist', true);

      const tag = scene.add.text(pos.x, pos.y - 20, '💊', {
        fontSize: '11px',
      });
      tag.setOrigin(0.5, 1);
      tag.setDepth(23);
      spr.setData('actorTag', tag);

      state.receptionist = {
        spr,
        nearSince: 0,
        dwellDone: false,
        cooldownUntil: 0,
      };
    }
  }

  function exit(scene) {
    state.battleSprites.forEach((spr) => {
      spr.getData('actorTag')?.destroy();
      spr.destroy();
    });
    state.chatterItems.forEach(({ spr }) => {
      spr.getData('actorTag')?.destroy();
      spr.destroy();
    });
    state.receptionist?.spr?.getData('actorTag')?.destroy();
    state.receptionist?.spr?.destroy();
    state.battleSprites = [];
    state.battleNpcs = [];
    state.chatterItems = [];
    state.receptionist = null;
    scene._interiorBattleSprites = [];
  }

  function setVisible(_scene, visible) {
    for (const spr of state.battleSprites) {
      spr.setVisible(visible);
      spr.getData('actorTag')?.setVisible(visible);
    }
    for (const { spr } of state.chatterItems) {
      spr.setVisible(visible);
      spr.getData('actorTag')?.setVisible(visible);
    }
    if (state.receptionist?.spr) {
      state.receptionist.spr.setVisible(visible);
      state.receptionist.spr.getData('actorTag')?.setVisible(visible);
    }
  }

  function update(scene, delta, showToast, onBattleEnd) {
    if (battleCfg && state.battleSprites.length) {
      if ((scene._actorBattleTick = (scene._actorBattleTick || 0) + 1) % 2 === 0) {
        checkBattleEncounters(scene, state, battleCfg, onBattleEnd, showToast);
      }
    }

    if (chatterCfg && state.chatterItems.length) {
      const now = performance.now();
      for (const item of state.chatterItems) {
        if (!item.spr.active || now < item.nextChat) continue;
        let line = item.def.line || item.def.quote;
        if (!line && item.def.phrases?.length) {
          line = item.def.phrases[Math.floor(Math.random() * item.def.phrases.length)];
        }
        if (!line) continue;
        showChatBubble(scene, `${placeId}-${item.def.id}`, line, item.spr.x, item.spr.y, {
          fontSize: '10px',
          backgroundColor: chatterCfg.bubbleBg || '#ffeaa7',
          color: chatterCfg.bubbleColor || '#2d3436',
          wordWrapWidth: chatterCfg.wordWrap ?? 140,
        });
        item.nextChat = now + item.interval + Math.random() * 3000;
      }
    }

    if (receptionistCfg && state.receptionist) {
      updateReceptionist(scene, layout, state, receptionistCfg, placeId, showToast);
    }
  }

  return { enter, exit, update, setVisible, state };
}

function updateReceptionist(scene, layout, actorState, cfg, placeId, showToast) {
  const rec = actorState.receptionist;
  const player = scene.player;
  if (!rec?.spr?.active || !player || scene.inBattle) {
    if (rec) rec.nearSince = 0;
    return;
  }

  const front = layout.tileToWorld(cfg.counterFrontTx ?? cfg.tx, cfg.counterFrontTy ?? cfg.ty + 2);
  const dist = Phaser.Math.Distance.Between(player.x, player.y, front.x, front.y);
  const inRange = dist <= (cfg.healRange ?? 50);
  const now = performance.now();

  if (!inRange || now < rec.cooldownUntil) {
    rec.nearSince = 0;
    rec.dwellDone = false;
    return;
  }

  if (!rec.nearSince) {
    rec.nearSince = now;
    rec.dwellDone = false;
    return;
  }

  if (rec.dwellDone || now - rec.nearSince < (cfg.dwellMs ?? 3000)) return;

  rec.dwellDone = true;
  rec.cooldownUntil = now + (cfg.cooldownMs ?? 6000);
  rec.nearSince = 0;

  const ps = scene.playerState;
  if (!ps) return;

  healPlayer(ps);
  savePlayer(ps);
  scene.onPlayerUpdated?.(ps);

  const healLine = cfg.healedLine ?? 'Xa estás curado. PS e movementos restaurados.';
  const farewellLine = cfg.farewellLine ?? 'Volve pronto.';
  const bubbleOpts = {
    fontSize: '10px',
    backgroundColor: cfg.bubbleBg || '#d5f5e3',
    color: cfg.bubbleColor || '#1e5631',
    wordWrapWidth: cfg.wordWrap ?? 150,
  };

  showChatBubble(scene, `${placeId}-receptionist`, healLine, rec.spr.x, rec.spr.y, bubbleOpts);
  showToast?.(healLine);

  scene.time.delayedCall(2400, () => {
    if (!rec.spr?.active) return;
    showChatBubble(scene, `${placeId}-receptionist`, farewellLine, rec.spr.x, rec.spr.y, bubbleOpts);
  });
}

function checkBattleEncounters(scene, actorState, battleCfg, onBattleEnd, showToast) {
  const p = scene.player;
  if (!p) return;

  let nearest = null;
  let nearestDist = NPC_ENCOUNTER_RANGE;

  for (const spr of actorState.battleSprites) {
    const npc = spr.getData('npc');
    if (npc.defeated) continue;
    const d = Phaser.Math.Distance.Between(p.x, p.y, spr.x, spr.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = { spr, npc };
    }
  }

  if (!nearest) return;

  const wantFight =
    Phaser.Math.Distance.Between(p.x, p.y, nearest.spr.x, nearest.spr.y) < 16 ||
    Phaser.Input.Keyboard.JustDown(scene.keyE);

  if (!wantFight || scene.encounterCooldown > 0) return;

  const createEnemy = battleCfg.createEnemy || defaultBattleEnemy;

  scene.inBattle = true;
  clearNavigation(scene);
  resetMovementState(scene);

  startBattle({
    player: scene.playerState,
    enemy: createEnemy(nearest.npc),
    onEnd: (result, updatedPlayer) => {
      scene.inBattle = false;
      scene.encounterCooldown = 2000;
      scene.playerState = updatedPlayer;

      if (result === 'win') {
        const defeatedNpc = nearest.npc;
        const defeatedSpr = nearest.spr;
        defeatedSpr.getData('actorTag')?.destroy();
        defeatedSpr.destroy();
        actorState.battleSprites = actorState.battleSprites.filter(
          (s) => s !== defeatedSpr
        );
        scene._interiorBattleSprites = actorState.battleSprites;

        const layout = scene.interiorConfig;
        if (layout && battleCfg) {
          respawnInteriorBattleNpc(
            scene,
            layout,
            battleCfg,
            actorState,
            defeatedNpc,
            defeatedSpr,
            showToast
          );
        }

        scene.playerState.hp = scene.playerState.maxHp;
        savePlayer(scene.playerState);
      } else if (result !== 'death') {
        scene.playerState.hp = Math.max(1, scene.playerState.hp);
        savePlayer(scene.playerState);
      }

      onBattleEnd?.(result, updatedPlayer, nearest.npc);
    },
  });
}

/** Textura sacerdote (compartida) */
export function drawPriestTexture(g) {
  g.fillStyle(0xf8f8f8, 1);
  g.fillRect(2, 10, 12, 12);
  g.fillRect(1, 12, 14, 10);
  g.fillStyle(0xffffff, 1);
  g.fillRect(3, 8, 10, 4);
  g.fillStyle(0xffdbac, 1);
  g.fillRect(5, 4, 6, 6);
  g.fillStyle(0x222222, 1);
  g.fillRect(5, 6, 2, 2);
  g.fillRect(9, 6, 2, 2);
  g.fillStyle(0xc9a227, 1);
  g.fillRect(7, 14, 2, 4);
}

export function createClergyEnemy(npc) {
  const enemy = defaultBattleEnemy(npc);
  return { ...enemy, sprite: 'priest', faction: 'clergy' };
}

/** Recepcionista do hospital (bata branca) */
export function drawReceptionistTexture(g) {
  g.fillStyle(0xffffff, 1);
  g.fillRect(2, 10, 12, 12);
  g.fillRect(1, 11, 14, 10);
  g.fillStyle(0x27ae60, 1);
  g.fillRect(6, 12, 4, 6);
  g.fillStyle(0xffdbac, 1);
  g.fillRect(5, 4, 6, 6);
  g.fillStyle(0x5c3317, 1);
  g.fillRect(4, 3, 8, 3);
  g.fillRect(6, 2, 4, 2);
  g.fillStyle(0x222222, 1);
  g.fillRect(5, 6, 2, 2);
  g.fillRect(9, 6, 2, 2);
  g.fillStyle(0xc0392b, 1);
  g.fillRect(7, 8, 2, 1);
}
