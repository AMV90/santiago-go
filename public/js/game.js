import {
  MAP_SAVE_VERSION,
  NPC_ENCOUNTER_RANGE,
  CAMERA_LERP,
  MOVE_SEND_INTERVAL_MS,
} from './config.js';
import {
  queueSpriteAssets,
  createFallbackTextures,
  resolveSpriteKeys,
  setupSpriteAnimations,
  applyCharacterSprite,
  updateWalkAnim,
} from './sprites.js';
import { ensurePeleteiroTextureFilter } from './interiors/peleteiro-tile-render.js';
import { ensureLpcTextureFilter } from './sprites.js';
import { setupCameraPan, notifyPlayerMoved } from './camera-pan.js';
import {
  connectMultiplayer,
  joinMultiplayer,
  sendPosition,
  sendChat,
  disconnectMultiplayer,
  isOnline,
} from './network.js';
import { setupChatInput, isChatOpen } from './chat-input.js';
import { showChatBubble, updateChatBubblePositions, clearChatBubbles } from './chat-bubbles.js';
import {
  createRemoteLayer,
  syncRemotePlayers,
  removeRemotePlayer,
  updateRemoteNametagPositions,
} from './remote-players.js';
import { fetchBootstrap, fetchRespawnNpc } from './game-api.js';
import { initStreetChunks, ensureStreetChunks } from './street-chunks.js';
import { clearAllNametags } from './player-nametags.js';
import { createMinimap, destroyMinimap } from './minimap.js';
import { clearNavigation } from './path-navigation.js';
import { loadPlayer, savePlayer, xpProgress, resetPlayer } from './player-state.js';
import { createEnemyFromNpc } from './npcs.js';
import { initBattleUI, startBattle, isBattleOpen } from './battle-ui.js';
import { createMapProjection } from './map-projection.js';
import { createWalkBotSprites, updateWalkBots, tryCitizenInteraction, countCitizensNear } from './walk-bots.js';
import {
  updatePlayerMovement,
  getLastMoveDelta,
  resetMovementState,
} from './movement-controller.js';
import { THROW_ITEMS } from './items.js';
import { addItem, ensureInventory, countItem, inventoryList } from './inventory.js';
import { createPickupSprites } from './world-pickups.js';
import {
  initHealingMarkers,
  updateHealingMarkers,
  destroyHealingMarkers,
} from './healing-sites.js';
import {
  createDogSprites,
  throwBoneAtDog,
  BONES_TO_CAPTURE,
} from './dog-system.js';
import { createTileManager } from './tile-manager.js';
import { setupMapClickNavigation } from './map-click.js';
import { getTabPlayerName, getTabSpawnOffset } from './player-identity.js';
import { initAllPlaceDoors } from './interiors/index.js';
import {
  isInInterior,
  updateInteriorZone,
  exitInterior,
  centerInteriorCamera,
  CATHEDRAL_ZONE_ID,
  BAR_MOMO_ZONE_ID,
  RIQUELA_ZONE_ID,
  MODUS_VIVENDI_ZONE_ID,
  AREA_CENTRAL_ZONE_ID,
  ESTACION_TREN_ZONE_ID,
} from './interior-zone.js';

const MAP_ZOOM = 16;
const PICKUP_RANGE = 20;
const DOG_RANGE = 28;

let phaserGame = null;

export async function initGame(mpOptions = null, onProgress) {
  const progress = (msg, pct) => onProgress?.(msg, pct);

  if (typeof Phaser === 'undefined') {
    throw new Error(
      'Phaser non cargou. Comproba a internet, recarga a páxina e usa http://localhost:3000'
    );
  }

  if (phaserGame) {
    phaserGame.destroy(true);
    phaserGame = null;
  }

  initBattleUI();

  progress('Conectando co servidor…', 10);
  const boot = await fetchBootstrap();

  progress('Recibindo mundo…', 40);
  const mapVersion = localStorage.getItem('santiago-go-map-version');
  const needFresh = mapVersion !== boot.version;
  if (needFresh) {
    localStorage.setItem('santiago-go-map-version', boot.version);
    localStorage.removeItem('santiago-go-defeated');
    localStorage.removeItem('santiago-go-collected');
  }

  let playerState = loadPlayer(needFresh);
  if (needFresh) {
    playerState = resetPlayer();
  }
  ensureInventory(playerState);

  const defeatedIds = JSON.parse(localStorage.getItem('santiago-go-defeated') || '[]');
  let npcs = boot.npcs;
  if (defeatedIds.length) {
    progress('Repoboando rivais…', 48);
    const active = npcs.filter((n) => !defeatedIds.includes(n.id));
    const replacements = [];
    for (const old of npcs.filter((n) => defeatedIds.includes(n.id))) {
      try {
        const { npc } = await fetchRespawnNpc({
          level: old.level,
          faction: old.faction || 'urban',
          awayFromX: old.x,
          awayFromY: old.y,
        });
        replacements.push(npc);
      } catch {
        replacements.push({ ...old, defeated: false, id: `${old.id}-retry` });
      }
    }
    npcs = [...active, ...replacements];
    localStorage.removeItem('santiago-go-defeated');
  }

  const mapData = {
    bounds: boot.bounds,
    width: boot.width,
    height: boot.height,
    meta: boot.meta,
    streets: [],
  };

  const collectedIds = JSON.parse(localStorage.getItem('santiago-go-collected') || '[]');
  const worldPickups = boot.pickups;
  const dogs = boot.dogs;
  const spawnPoint = boot.spawn;
  const projection = createMapProjection(mapData, MAP_ZOOM);
  const walkBots = Array.isArray(boot.walkBots) ? boot.walkBots : [];
  const wanderPoints = boot.wanderPoints || [];
  const initialStreets = boot.initialStreets;

  progress('Iniciando motor…', 70);

  const container = document.getElementById('game-container');
  const startW = Math.max(container?.clientWidth || 0, window.innerWidth);
  const startH = Math.max(container?.clientHeight || 0, window.innerHeight - 60);

  return new Promise((resolve, reject) => {
    const bootTimeout = setTimeout(() => {
      reject(new Error('O xogo tardou demasiado en arrincar. Recarga e tenta de novo.'));
    }, 90000);

    const finishOk = () => {
      clearTimeout(bootTimeout);
      resolve();
    };
    const finishErr = (err) => {
      clearTimeout(bootTimeout);
      reject(err);
    };

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: startW,
    height: startH,
    backgroundColor: '#d8e8d4',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    scene: {
      init() {
        this.mapData = mapData;
        this.projection = projection;
        this.playerState = playerState;
        this.npcs = npcs;
        this.spawnPoint = spawnPoint;
        this.collectedIds = collectedIds;
        this.worldPickups = worldPickups;
        this.dogs = dogs;
        this.walkBots = walkBots;
        this.wanderPoints = wanderPoints;
        this.initialStreets = initialStreets;
        this._bootstrapNpcs = JSON.parse(JSON.stringify(npcs));
      },
      preload() {
        this.load.on('loaderror', (file) => {
          console.error('[Santiago Go] Erro ao cargar:', file?.key, file?.src);
        });
        createFallbackTextures(this);
        queueSpriteAssets(this);
        this.load.image('first-aid', 'assets/icons/first-aid.svg');
      },
      create() {
        try {
        resolveSpriteKeys(this);
        ensurePeleteiroTextureFilter(this);
        ensureLpcTextureFilter(this);
        setupSpriteAnimations(this);
        this.applyBotSprite = (spr, i) => applyCharacterSprite(spr, 'bot', this, i);
        this.updateBotWalkAnim = (spr, dx, dy) => updateWalkAnim(spr, dx, dy, this, 'bot');

        this.inBattle = false;
        this.encounterCooldown = 0;
        this._moveSendAcc = 0;
        this.mpSocketId = null;

        showLoading(true);
        createWorld(this);
        createRemoteLayer(this);

        this.mpEnabled = false;
        setupChatInput(this);
        autoConnectMultiplayer(this, playerState, mpOptions?.name);

        setupMultiplayerToggle(this, playerState);

        updateStatsHud(playerState);
        showLoading(false);
        showIntroOnce();
        this._frameTick = 0;
        resizeGame();
        progress('Listo', 100);
        finishOk();
        } catch (err) {
          finishErr(err);
        }
      },
      update(time, delta) {
        if (this.inBattle || isBattleOpen()) return;
        if (this.encounterCooldown > 0) this.encounterCooldown -= delta;

        if (isInInterior(this)) {
          updateInteriorZone(this, delta, showWorldToast, handlePriestBattleEnd);
        } else {
          handleMovement(this, delta);
          if (this.walkBotSprites) updateWalkBots(this, this.walkBots, this.walkBotSprites, delta);
          if (this.tileManager) this.tileManager.update();
          if ((this._chunkTick = (this._chunkTick || 0) + 1) % 20 === 0) {
            ensureStreetChunks(this);
          }
          checkPickups(this);
          updateCompanionFollow(this);
          if ((this._frameTick = (this._frameTick || 0) + 1) % 2 === 0) {
            if (!tryDogBoneThrow(this)) checkNpcEncounters(this);
          }
          updateHealingMarkers(this);
          this.minimap?.draw(this);
        }

        updateHud(this);
        updateMpHudFromScene(this);
        updateChatBubblePositions(this);
        updateRemoteNametagPositions(this);
      },
    },
  };

  try {
    phaserGame = new Phaser.Game(config);
  } catch (err) {
    finishErr(err);
    return;
  }

  phaserGame.onPlayerUpdated = (p) => {
    playerState = p;
    updateStatsHud(p);
  };

  window.addEventListener('resize', resizeGame);
  phaserGame._resizeHandler = resizeGame;
  phaserGame._mpDisconnect = () => disconnectMultiplayer();
  });
}

async function setupMultiplayer(scene, mpOptions, playerState) {
  let localId = null;
  let hasJoined = false;

  const applyRemotes = (list) => {
    scene._remoteList = (list || []).filter((x) => x.id && x.id !== localId);
    syncRemotePlayers(scene, scene._remoteList, localId);
    refreshMpHud(scene);
  };

  const doJoin = () => {
    if (!scene.player) return;
    const off = getTabSpawnOffset();
    joinMultiplayer({
      name: mpOptions.name,
      level: playerState.level,
      x: scene.player.x + off.x,
      y: scene.player.y + off.y,
    });
    sendPosition(scene.player.x + off.x, scene.player.y + off.y, playerState.level);
  };

  const handlers = {
    onWorldState: (list) => applyRemotes(list || []),
    onPlayerJoined: (p) => {
      if (!p?.id || p.id === localId) return;
      applyRemotes([...getRemoteList(scene).filter((x) => x.id !== p.id), p]);
      showWorldToast(`${p.name} entrou no mapa`);
    },
    onPlayerMoved: (p) => {
      if (!p?.id || p.id === localId) return;
      const list = getRemoteList(scene);
      const idx = list.findIndex((x) => x.id === p.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...p };
      else list.push(p);
      applyRemotes(list);
    },
    onPlayerLeft: (p) => {
      if (!p?.id) return;
      removeRemotePlayer(scene, p.id);
      scene._remoteList = getRemoteList(scene).filter((x) => x.id !== p.id);
      refreshMpHud(scene);
    },
    onChat: (msg) => {
      if (!msg?.text) return;
      if (msg.id === localId) {
        showChatBubble(scene, 'local', msg.text, scene.player.x, scene.player.y);
        return;
      }
      const spr = scene.remoteSprites?.get(msg.id);
      const x = spr?.x ?? msg.x;
      const y = spr?.y ?? msg.y;
      showChatBubble(scene, msg.id, msg.text, x, y);
    },
  };

  const socket = await connectMultiplayer(handlers);
  localId = socket.id;
  scene.mpSocketId = localId;
  scene._remoteList = [];

  doJoin();
  hasJoined = true;

  socket.on('connect', () => {
    if (!hasJoined) return;
    localId = socket.id;
    scene.mpSocketId = localId;
    doJoin();
  });

  const others = getRemoteList(scene).length;
  showWorldToast(
    others > 0
      ? `En liña · ${others + 1} xogadores no mapa`
      : `En liña como ${mpOptions.name} · abre outra pestaña para ver máis xogadores`
  );
  refreshMpHud(scene);
}

function autoConnectMultiplayer(scene, playerState, nameOverride) {
  const mpOptions = { name: nameOverride || getTabPlayerName(), enabled: true };
  scene.mpEnabled = true;
  setupMultiplayer(scene, mpOptions, playerState).catch((err) => {
    scene.mpEnabled = false;
    updateMpStatus(false, 1);
    showWorldToast(`Modo local · ${err.message}`);
  });
}

function setupMultiplayerToggle(scene, playerState) {
  scene.input.keyboard.on('keydown-M', async () => {
    if (scene.inBattle || isBattleOpen()) return;

    if (scene.mpEnabled) {
      disconnectMultiplayer();
      scene.mpEnabled = false;
      scene._remoteList = [];
      for (const id of [...scene.remoteSprites.keys()]) removeRemotePlayer(scene, id);
      updateMpStatus(false, 1);
      showWorldToast('Multixogador desactivado');
      return;
    }

    const name = getTabPlayerName();
    scene.mpEnabled = true;
    setupChatInput(scene);
    try {
      await setupMultiplayer(scene, { name, enabled: true }, playerState);
    } catch (err) {
      scene.mpEnabled = false;
      showWorldToast(`Sen multixogador: ${err.message}. Usa npm run play (porto 3000).`);
    }
  });
}

function refreshMpHud(scene) {
  const n = (scene.remoteSprites?.size || 0) + 1;
  updateMpStatus(isOnline(), n);
}

function getRemoteList(scene) {
  return scene._remoteList || [];
}

function updateMpStatus(_online, _count) {
  // Estado multixogador: xa non se mostra no panel compacto de stats
}

function showLoading(on) {
  let el = document.getElementById('game-loading');
  if (on && !el) {
    el = document.createElement('div');
    el.id = 'game-loading';
    el.className = 'game-loading';
    el.textContent = 'Cargando mapa…';
    document.getElementById('panel-game')?.appendChild(el);
  }
  if (el) el.style.display = on ? 'block' : 'none';
}

function resizeGame() {
  if (!phaserGame) return;
  const shell = document.getElementById('app-shell');
  const container = document.getElementById('game-container');
  if (shell?.classList.contains('hidden') || !container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w > 0 && h > 0) {
    phaserGame.scale.resize(w, h);
    const scene = phaserGame.scene?.scenes?.[0];
    scene?.cameras?.main?.setViewport(0, 0, w, h);
    if (scene && isInInterior(scene)) centerInteriorCamera(scene);
  }
}

function showIntroOnce() {
  const key = 'santiago-go-intro-seen';
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');

  const el = document.createElement('div');
  el.className = 'game-intro-toast';
  el.innerHTML = `
    <p><strong>Santiago Go</strong></p>
    <p>Naces na <strong>Catedral de Santiago</strong>. Eres unha persoa conflictiva.</p>
    <p>Se morres en combate, volves ao nivel 1 na Catedral.</p>
    <p>Só podes andar polas <strong>ruas</strong>. Recolle obxectos (pedras, palos, ósos…) andando sobre eles.</p>
    <p>En combate: <strong>Obxecto</strong> para lanzar. <strong>3 ósos</strong> a un can = compañeiro que ataca tras cada golpe teu.</p>
    <button type="button" id="intro-close">Entendido</button>
  `;
  document.body.appendChild(el);
  document.getElementById('intro-close').onclick = () => el.remove();
}

function hpHudToneClass(pct) {
  if (pct > 50) return 'hp-high';
  if (pct > 25) return 'hp-mid';
  return 'hp-low';
}

function updateStatsHud(player) {
  const hpRow = document.getElementById('hud-hp-bar');
  const hpFill = document.getElementById('hud-hp-fill');
  const hpText = document.getElementById('hud-hp-text');
  const xpFill = document.getElementById('hud-xp-fill');
  const xpText = document.getElementById('hud-xp-text');
  if (!hpRow) return;

  const xp = xpProgress(player);
  const pct =
    player.maxHp > 0 ? Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) : 0;
  const tone = hpHudToneClass(pct);

  const innerBar = hpRow.querySelector('.hp-bar');
  if (hpFill) hpFill.style.width = `${pct}%`;
  if (innerBar) {
    innerBar.classList.remove('hp-high', 'hp-mid', 'hp-low');
    innerBar.classList.add(tone);
  }
  if (hpText) hpText.textContent = `${player.hp}/${player.maxHp}`;
  hpRow.setAttribute('aria-valuenow', String(Math.round(pct)));

  if (xpFill) xpFill.style.width = `${xp.pct}%`;
  if (xpText) xpText.textContent = `Nv${player.level} · ${xp.current}/${xp.need}`;
}

function updateMpHudFromScene(scene) {
  if (!scene) return;
  if (!isOnline()) {
    updateMpStatus(false, 0);
    return;
  }
  refreshMpHud(scene);
}

function showWorldToast(msg) {
  let el = document.getElementById('world-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'world-toast';
    el.className = 'world-toast';
    document.getElementById('panel-game')?.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(showWorldToast._t);
  showWorldToast._t = setTimeout(() => el.classList.remove('visible'), 3200);
}

function addBattleNpcSprite(scene, npc) {
  const spr = scene.add.sprite(npc.x, npc.y, 'char-npc');
  applyCharacterSprite(spr, 'npc', scene, scene.npcSprites.length % 6, {
    lpcId: npc.characterId ?? npc.lpcId,
  });
  spr.setData('npc', npc);
  spr.setDepth(9);
  scene.npcSprites.push(spr);
  return spr;
}

async function replaceDefeatedOverworldNpc(scene, defeatedNpc, spr) {
  const fromX = spr?.x ?? defeatedNpc.x;
  const fromY = spr?.y ?? defeatedNpc.y;

  try {
    const { npc } = await fetchRespawnNpc({
      level: defeatedNpc.level,
      faction: defeatedNpc.faction || 'urban',
      awayFromX: fromX,
      awayFromY: fromY,
    });
    scene.npcs.push(npc);
    addBattleNpcSprite(scene, npc);
    showWorldToast(`${npc.name} (nv. ${npc.level}) apareceu noutro punto do mapa.`);
  } catch {
    showWorldToast('Non se puido repoboar o rival agora. Recarga a páxina.');
  }
}

function respawnAtCathedral(scene) {
  if (isInInterior(scene)) {
    exitInterior(scene, null, { immediate: true });
  }

  const pos = scene.spawnPoint;
  scene.player.setPosition(pos.x, pos.y);
  resetMovementState(scene);
  scene.player.setVisible(true);
  scene.lastValid = { x: pos.x, y: pos.y };

  const cam = scene.cameras.main;
  cam.stopFollow();
  cam.setZoom(1.2);
  cam.setBounds(0, 0, scene.mapData.width, scene.mapData.height);
  cam.centerOn(pos.x, pos.y);
  cam.startFollow(scene.player, true, CAMERA_LERP, CAMERA_LERP);
}

function refreshBattleNpcs(scene) {
  scene.npcSprites.forEach((s) => s.destroy());
  scene.npcSprites = [];
  scene.npcs = JSON.parse(JSON.stringify(scene._bootstrapNpcs || []));
  localStorage.removeItem('santiago-go-defeated');
  for (const npc of scene.npcs) {
    npc.defeated = false;
    addBattleNpcSprite(scene, npc);
  }
}

function createWorld(scene) {
  const mapData = scene.mapData;
  const { width, height } = mapData;

  scene.cameras.main.setBounds(0, 0, width, height);
  scene.mapBounds = { width, height };

  // Chan base (sempre visible aínda que fallen os tiles)
  const ground = scene.add.graphics();
  ground.fillStyle(0xd8e8d4, 1);
  ground.fillRect(0, 0, width, height);
  ground.setDepth(0);
  scene.ground = ground;

  const streetGfx = scene.add.graphics();
  streetGfx.setDepth(2);
  scene.streetGfx = streetGfx;
  initStreetChunks(scene, scene.initialStreets || []);

  // Tiles raster vía servidor (/api/tiles)
  scene.tileManager = createTileManager(scene);
  scene.tileManager.update();

  const player = scene.add.sprite(scene.spawnPoint.x, scene.spawnPoint.y, 'char-player');
  applyCharacterSprite(player, 'player', scene);
  player.setDepth(20);
  scene.player = player;
  scene.lastValid = { x: scene.spawnPoint.x, y: scene.spawnPoint.y };

  scene.walkBotSprites = createWalkBotSprites(scene, scene.walkBots);

  initHealingMarkers(scene, showWorldToast);

  scene.npcSprites = [];
  for (const npc of scene.npcs) {
    if (npc.defeated) continue;
    addBattleNpcSprite(scene, npc);
  }

  scene.pickupSprites = createPickupSprites(scene, scene.worldPickups, scene.collectedIds);
  scene.dogSprites = createDogSprites(scene, scene.dogs, scene.playerState);
  setupCompanionSprite(scene);

  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.wasd = scene.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D,
  });
  scene.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  scene.input.keyboard.on('keydown-SPACE', (ev) => {
    if (scene.inBattle || isBattleOpen()) return;
    if (isChatOpen()) return;
    if (tryCitizenInteraction(scene)) ev.stopPropagation();
  });

  scene.minimap = createMinimap(mapData, scene);
  setupMapClickNavigation(scene);
  setupCameraZoom(scene);
  setupCameraPan(scene);

  scene.scale.on('resize', (size) => {
    scene.cameras.main.setViewport(0, 0, size.width, size.height);
  });

  initAllPlaceDoors(scene, showWorldToast);
  respawnAtCathedral(scene);
}

function handleMovement(scene, delta) {
  if (isChatOpen()) return;
  const p = scene.player;
  const moved = updatePlayerMovement(scene, delta);
  if (!moved) return;

  notifyPlayerMoved(scene);

  const { dx, dy } = getLastMoveDelta(scene);
  updateWalkAnim(p, dx, dy, scene, 'player');

  scene._moveSendAcc = (scene._moveSendAcc || 0) + delta;
  if (scene.mpEnabled && scene._moveSendAcc >= MOVE_SEND_INTERVAL_MS) {
    scene._moveSendAcc = 0;
    sendPosition(p.x, p.y, scene.playerState.level);
  }
}

function refreshDogs(scene) {
  scene.dogSprites?.forEach((s) => s.destroy());
  scene.dogSprites = createDogSprites(scene, scene.dogs, scene.playerState);
  setupCompanionSprite(scene);
}

function setupCompanionSprite(scene) {
  scene.companionSprite = null;
  if (!scene.playerState.dog?.captured) return;
  const dog = scene.dogs.find((d) => d.id === scene.playerState.dog.companionId);
  if (!dog) return;
  const spr = scene.dogSprites.find((s) => s.getData('dog')?.id === dog.id);
  if (spr) {
    scene.companionSprite = spr;
    spr.setTexture('dog-companion');
    spr.setTint(0xffeaa7);
  }
}

function updateCompanionFollow(scene) {
  if (!scene.companionSprite || !scene.player) return;
  scene.companionSprite.x = scene.player.x - 14;
  scene.companionSprite.y = scene.player.y + 12;
}

function setupCameraZoom(scene) {
  const cam = scene.cameras?.main;
  if (!cam) return;

  const clampZoom = (z) => Phaser.Math.Clamp(z, 0.7, 2.1);

  // Cando o usuario roda no rato, cambiamos zoom e deixamos que a cámara siga ó xogador.
  scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    // Se está en combate/non xogando, non cambiamos o zoom.
    if (scene.inBattle) return;

    // deltaY < 0 -> zoom in
    const factor = Math.pow(1.0018, -deltaY);
    const nextZoom = clampZoom(cam.zoom * factor);
    cam.setZoom(nextZoom);
  });
}

function checkPickups(scene) {
  const p = scene.player;
  for (let i = scene.pickupSprites.length - 1; i >= 0; i--) {
    const spr = scene.pickupSprites[i];
    const pickup = spr.getData('pickup');
    const d = Phaser.Math.Distance.Between(p.x, p.y, spr.x, spr.y);
    if (d > PICKUP_RANGE) continue;

    addItem(scene.playerState, pickup.itemId);
    savePlayer(scene.playerState);
    scene.collectedIds.push(pickup.id);
    localStorage.setItem('santiago-go-collected', JSON.stringify(scene.collectedIds));
    spr.destroy();
    scene.pickupSprites.splice(i, 1);
    showWorldToast(`${THROW_ITEMS[pickup.itemId].name} recollido (E en combate: Obxecto)`);
    updateStatsHud(scene.playerState);
  }
}

function handlePriestBattleEnd(scene, result, updatedPlayer) {
  scene.playerState = updatedPlayer;
  updateStatsHud(updatedPlayer);
  if (phaserGame?.onPlayerUpdated) phaserGame.onPlayerUpdated(updatedPlayer);

  if (result === 'death') {
    scene.collectedIds = [];
    scene.pickupSprites?.forEach((s) => s.destroy());
    scene.pickupSprites = createPickupSprites(scene, scene.worldPickups, []);
    refreshBattleNpcs(scene);
    refreshDogs(scene);
    respawnAtCathedral(scene);
  }
}

function tryDogBoneThrow(scene) {
  if (isInInterior(scene)) return false;
  if (!Phaser.Input.Keyboard.JustDown(scene.keyE)) return false;

  const p = scene.player;
  let nearest = null;
  let dist = DOG_RANGE;

  for (const spr of scene.dogSprites) {
    const dog = spr.getData('dog');
    if (scene.playerState.dog?.captured && dog.id !== scene.playerState.dog.companionId) continue;
    if (scene.playerState.dog?.captured && dog.id === scene.playerState.dog.companionId) continue;
    const d = Phaser.Math.Distance.Between(p.x, p.y, spr.x, spr.y);
    if (d < dist) {
      dist = d;
      nearest = { spr, dog };
    }
  }

  if (!nearest || countItem(scene.playerState, 'hueso') < 1) return false;

  const result = throwBoneAtDog(scene.playerState, nearest.dog);
  savePlayer(scene.playerState);
  showWorldToast(result.msg);

  if (result.captured) {
    nearest.spr.setTexture('dog-companion');
    nearest.spr.setTint(0xffeaa7);
    scene.companionSprite = nearest.spr;
    scene.dogSprites.forEach((s) => {
      const d = s.getData('dog');
      if (d.id !== nearest.dog.id) s.destroy();
    });
    scene.dogSprites = [nearest.spr];
  }

  updateStatsHud(scene.playerState);
  return true;
}

function checkNpcEncounters(scene) {
  const p = scene.player;
  let nearest = null;
  let nearestDist = NPC_ENCOUNTER_RANGE;

  for (const spr of scene.npcSprites) {
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
    Phaser.Math.Distance.Between(p.x, p.y, nearest.spr.x, nearest.spr.y) < 14 ||
    Phaser.Input.Keyboard.JustDown(scene.keyE);

  if (wantFight && scene.encounterCooldown <= 0) {
    triggerEncounter(scene, nearest.npc, nearest.spr);
  }
}

function triggerEncounter(scene, npc, spr) {
  scene.inBattle = true;
  clearNavigation(scene);
  resetMovementState(scene);

  startBattle({
    player: scene.playerState,
    enemy: createEnemyFromNpc(npc, spr),
    onEnd: (result, updatedPlayer) => {
      scene.inBattle = false;
      scene.encounterCooldown = 2000;
      scene.playerState = updatedPlayer;

      if (result === 'death') {
        scene.collectedIds = [];
        scene.pickupSprites?.forEach((s) => s.destroy());
        scene.pickupSprites = createPickupSprites(scene, scene.worldPickups, []);
        refreshBattleNpcs(scene);
        refreshDogs(scene);
        respawnAtCathedral(scene);
      } else if (result === 'win') {
        const defeatedNpc = npc;
        spr.destroy();
        scene.npcSprites = scene.npcSprites.filter((s) => s !== spr);
        const idx = scene.npcs.findIndex((n) => n.id === defeatedNpc.id);
        if (idx >= 0) scene.npcs.splice(idx, 1);
        void replaceDefeatedOverworldNpc(scene, defeatedNpc, spr);
        scene.playerState.hp = scene.playerState.maxHp;
        savePlayer(scene.playerState);
      } else {
        scene.playerState.hp = Math.max(1, scene.playerState.hp);
        savePlayer(scene.playerState);
      }

      updateStatsHud(scene.playerState);
      if (phaserGame?.onPlayerUpdated) phaserGame.onPlayerUpdated(scene.playerState);
    },
  });
}

function updateHud(scene) {
  const label = document.getElementById('hud-location');
  if (!label) return;
  if (isInInterior(scene)) {
    if (scene.interiorZone === CATHEDRAL_ZONE_ID) {
      const nearBattle = scene._interiorBattleSprites?.some((spr) => {
        const npc = spr.getData('npc');
        return (
          !npc?.defeated &&
          Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spr.x, spr.y) <
            NPC_ENCOUNTER_RANGE
        );
      });
      label.textContent = nearBattle
        ? 'Catedral · E ou choca co sacerdote · ↓ na porta para saír'
        : 'Catedral · WASD ou clic · ↓ ou E na porta para saír';
      return;
    }
    if (scene.interiorZone === BAR_MOMO_ZONE_ID) {
      label.textContent =
        'Pub Momo · Barra e terraza ao fondo · ← ou E na porta para saír';
      return;
    }
    if (scene.interiorZone === RIQUELA_ZONE_ID) {
      label.textContent =
        'Riquela Club · Pasillo · Sala ao fondo · ↓ ou E na porta para saír';
      return;
    }
    if (scene.interiorZone === MODUS_VIVENDI_ZONE_ID) {
      label.textContent =
        'Modus Vivendi · Barra arriba · Escaleiras abaixo · ↓ ou E para saír';
      return;
    }
    if (scene.interiorZone === AREA_CENTRAL_ZONE_ID) {
      label.textContent =
        'Área Central · Galería donut · Parque no centro · ↓ ou E para saír';
      return;
    }
    if (scene.interiorZone === ESTACION_TREN_ZONE_ID) {
      label.textContent =
        'Estación · Andéns ao fondo · Taquillas · ↓ ou E na porta para saír';
      return;
    }
    if (scene.interiorZone === 'parque-alameda') {
      label.textContent =
        'Alameda (grande) · Ferradura · Santa Susana · Pilar · Patos · ↓ ou E saír';
      return;
    }
    if (scene.interiorZone?.startsWith('corte-ingles-')) {
      label.textContent = `${scene.interiorConfig?.label || 'Corte Inglés'} · Zonas por cor · Escaleiras ↑↓ · Planta baixa: saír ↓`;
      return;
    }
    if (scene.interiorZone?.startsWith('peleteiro-')) {
      const name = scene.interiorConfig?.label || 'Peleteiro';
      label.textContent = `${name} · Escaleiras: camiña ↑ ou ↓ (sen E) · Saír á rúa: ↓ no patio`;
      return;
    }
    if (scene.interiorConfig?.label && scene.interiorZone?.match(/^(mercado-|museo-|hostal-|convento-|pazo-|biblioteca-|auditorio-|cidade-|casa-|parque-|palacio-|as-|estadio-|cgac|san-martin|colexio-)/)) {
      label.textContent = `${scene.interiorConfig.label} · Explora o lugar · ↓ ou E na porta`;
      return;
    }
    if (scene.interiorZone?.startsWith('hospital-')) {
      label.textContent =
        'Mostrador · Acércate 3 s para curarte · ↓ ou E na porta para saír';
      return;
    }
    label.textContent = 'Interior · WASD ou clic para moverte';
    return;
  }
  const near = scene.npcSprites.some((spr) => {
    const npc = spr.getData('npc');
    return (
      !npc.defeated &&
      Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spr.x, spr.y) <
        NPC_ENCOUNTER_RANGE
    );
  });
  const mapHint = '';
  const totalCitizens = scene.walkBotSprites?.length ?? scene.walkBots?.length ?? 0;
  const nearCitizens = countCitizensNear(scene, 900);
  const citizenHint =
    totalCitizens > 0
      ? ` · ${nearCitizens} cidadán${nearCitizens === 1 ? '' : 's'} preto · Espazo: falar`
      : '';
  label.textContent = near
    ? 'Prema E ou choca para pelexar · Só ruas'
    : `NV ${scene.playerState.level} · E: combate${citizenHint}${mapHint}`;
}

export { resizeGame };

export function destroyGame() {
  const scene = phaserGame?.scene?.scenes?.[0];
  if (scene) {
    destroyMinimap(scene.minimap);
    clearChatBubbles(scene);
    clearAllNametags(scene);
    destroyHealingMarkers(scene);
    scene._closeChat?.();
  }
  phaserGame?._mpDisconnect?.();
  if (phaserGame?._resizeHandler) {
    window.removeEventListener('resize', phaserGame._resizeHandler);
  }
  document.getElementById('battle-overlay')?.classList.add('hidden');
  if (phaserGame) {
    phaserGame.destroy(true);
    phaserGame = null;
  }
}
