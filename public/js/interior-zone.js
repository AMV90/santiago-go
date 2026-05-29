import { updateInteriorMovement } from './interior-movement.js';
import { resetMovementState, getLastMoveDelta } from './movement-controller.js';
import { updateWalkAnim } from './sprites.js';
import { enterMultiplayerZone, sendInteriorPosition } from './network.js';
import {
  getInteriorConfig,
  CATHEDRAL_ZONE_ID,
  BAR_MOMO_ZONE_ID,
  setPlaceDoorsVisible,
} from './interiors/index.js';
import { requestInteriorNavigate, clearInteriorNavigation } from './interiors/interior-pathfinding.js';
import { findLinkCharForScene } from './interiors/interior-links.js';
import { buildPeleteiroForgeInterior } from './interiors/peleteiro-forge-render.js';
import { resetCameraPanState, notifyPlayerMoved } from './camera-pan.js';

const STAIR_LINK_COOLDOWN_MS = 700;

function primeInteriorLinkState(scene) {
  scene._linkTilePrev = findLinkCharForScene(scene) || '';
  scene._linkCooldownUntil = performance.now() + STAIR_LINK_COOLDOWN_MS;
}

function tileCharAtWorld(cfg, x, y) {
  const tx = Math.floor(x / cfg.tileSize);
  const ty = Math.floor(y / cfg.tileSize);
  return { tx, ty, char: cfg.getTileAt(tx, ty) };
}

function makeCollision(cfg) {
  return (x, y, radius = 6) => {
    const pts = [
      [x, y],
      [x - radius, y],
      [x + radius, y],
      [x, y - radius],
      [x, y + radius],
    ];
    for (const [px, py] of pts) {
      const { char } = tileCharAtWorld(cfg, px, py);
      if (cfg.isBlocked(char)) return true;
    }
    return false;
  };
}

function buildInteriorGraphics(scene, cfg, placeId) {
  if (cfg.tileset === 'peleteiro-forge') {
    return buildPeleteiroForgeInterior(scene, cfg, placeId);
  }

  const { rows, tileSize, tileColors, label } = cfg;
  const g = scene.add.graphics();
  g.setDepth(3);

  for (let ty = 0; ty < rows.length; ty++) {
    const row = rows[ty];
    for (let tx = 0; tx < row.length; tx++) {
      const ch = row[tx];
      const color = tileColors[ch] ?? 0x999999;
      const x = tx * tileSize;
      const y = ty * tileSize;
      g.fillStyle(color, 1);
      g.fillRect(x, y, tileSize, tileSize);
      if (ch === 'D') {
        g.fillStyle(0x3d2817, 1);
        g.fillRect(x + 3, y + 4, tileSize - 6, tileSize - 5);
      }
      cfg.drawTileExtra?.(g, ch, x, y, tileSize);
    }
  }
  cfg.drawOverlay?.(g, tileSize, rows);

  const zoneTexts = cfg.spawnZoneBanners?.(scene, tileSize) ?? [];

  const stairTexts = [];
  cfg.stairLabels?.forEach((lab) => {
    const t = scene.add.text(lab.x, lab.y, lab.text, {
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      fontSize: '11px',
      color: '#eceff1',
      backgroundColor: 'rgba(38, 50, 56, 0.92)',
      padding: { x: 6, y: 3 },
    });
    t.setOrigin(0.5, 0.5);
    t.setDepth(6);
    stairTexts.push(t);
  });

  const walls = scene.add.graphics();
  walls.setDepth(4);
  walls.lineStyle(1, 0x2a1f14, 0.45);
  for (let ty = 0; ty < rows.length; ty++) {
    for (let tx = 0; tx < rows[ty].length; tx++) {
      if (rows[ty][tx] === '#') {
        walls.strokeRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
      }
    }
  }

  const title = scene.add.text(cfg.width / 2, 8, label, {
    fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
    fontSize: '12px',
    color: '#f5e6c8',
    backgroundColor: 'rgba(60, 40, 20, 0.85)',
    padding: { x: 8, y: 3 },
  });
  title.setOrigin(0.5, 0);
  title.setDepth(30);

  return { floor: g, walls, label: title, stairTexts, zoneTexts };
}

function setOverworldVisible(scene, visible) {
  const v = visible;
  scene.ground?.setVisible(v);
  scene.streetGfx?.setVisible(v);
  scene.tileManager?.setVisible(v);
  scene.walkBotSprites?.forEach((s) => s.setVisible(v));
  scene.npcSprites?.forEach((s) => s.setVisible(v));
  scene.pickupSprites?.forEach((s) => s.setVisible(v));
  scene.dogSprites?.forEach((s) => s.setVisible(v));
  scene.healingSprites?.forEach(({ spr, label }) => {
    spr.setVisible(v);
    label.setVisible(v);
  });
  scene.remoteSprites?.forEach((s) => s.setVisible(v));
  setPlaceDoorsVisible(scene, v);

  const cfg = getInteriorConfig(scene.interiorZone);
  cfg?.setVisible?.(scene, !v);

  const minimapEl = document.getElementById('game-minimap');
  if (minimapEl) minimapEl.style.display = v ? '' : 'none';
}

/** Encadra toda a planta centrada na pantalla */
export function centerInteriorCamera(scene) {
  const cfg = getInteriorConfig(scene.interiorZone);
  if (!cfg) return;

  const cam = scene.cameras.main;
  const container = document.getElementById('game-container');
  const vw = container?.clientWidth || cam.width;
  const vh = container?.clientHeight || cam.height;
  if (!vw || !vh) return;

  cam.setViewport(0, 0, vw, vh);

  const zoom = Phaser.Math.Clamp(Math.min(vw / cfg.width, vh / cfg.height) * 0.88, 0.45, 1.6);
  cam.setZoom(zoom);
  cam.stopFollow();

  const viewW = vw / zoom;
  const viewH = vh / zoom;

  // Margen nos bounds para poder centrar plantas máis pequenas ca viewport
  const padX = Math.max(0, (viewW - cfg.width) / 2);
  const padY = Math.max(0, (viewH - cfg.height) / 2);
  cam.setBounds(-padX, -padY, cfg.width + padX * 2, cfg.height + padY * 2);

  cam.centerOn(cfg.width / 2, cfg.height / 2);
  scene._interiorCamZoom = zoom;
}

function runTransition(scene, onMid, opts = {}) {
  scene.interiorTransition = true;
  const cam = scene.cameras.main;
  cam.fadeOut(280, 0, 0, 0);
  scene.time.delayedCall(300, () => {
    onMid();
    if (opts.centerInterior) {
      centerInteriorCamera(scene);
      scene.time.delayedCall(0, () => centerInteriorCamera(scene));
    }
    cam.fadeIn(320, 0, 0, 0);
    scene.time.delayedCall(340, () => {
      scene.interiorTransition = false;
      opts.onDone?.();
    });
  });
}

export function isInInterior(scene) {
  return !!scene.interiorZone;
}

function bindInteriorClickToMove(scene) {
  if (scene._interiorClickToMoveBound) return;
  scene._interiorClickToMoveBound = true;
  scene.input.on('pointerdown', (pointer) => {
    if (!pointer.leftButtonDown()) return;
    if (!isInInterior(scene)) return;
    if (scene.inBattle || scene.interiorTransition) return;
    if (document.activeElement?.tagName === 'INPUT') return;

    const cam = scene.cameras.main;
    const world = cam.getWorldPoint(pointer.x, pointer.y);
    requestInteriorNavigate(scene, world.x, world.y);
  });
}

export function enterInterior(scene, interiorId, showToast) {
  if (scene.interiorZone || scene.interiorTransition || scene.inBattle) return false;

  const cfg = getInteriorConfig(interiorId);
  if (!cfg) return false;

  const retPos = cfg.getReturnPosition(scene);
  scene._overworldReturn = {
    x: retPos.x,
    y: retPos.y,
    mapBounds: { width: scene.mapData.width, height: scene.mapData.height },
    zoom: scene.cameras.main.zoom,
    interiorId,
    exitToast: cfg.exitToast,
  };

  runTransition(
    scene,
    () => {
      setOverworldVisible(scene, false);
      scene.interiorLayer?.destroy(true);
      scene.interiorLayer = scene.add.container(0, 0);
      scene.interiorLayer.setDepth(5);

      const gfx = buildInteriorGraphics(scene, cfg, interiorId);
      scene.interiorLayer.add([
        gfx.floor,
        gfx.walls,
        gfx.label,
        ...gfx.stairTexts,
        ...gfx.zoneTexts,
        ...(gfx.propSprites || []),
      ]);

      scene.interiorZone = interiorId;
      scene.interiorConfig = cfg;
      scene.mapBounds = { width: cfg.width, height: cfg.height };
      scene.interiorCollision = makeCollision(cfg);
      resetCameraPanState(scene);

      const spawn = cfg.getEntrySpawn();
      scene.player.setPosition(spawn.x, spawn.y);
      resetMovementState(scene);
      scene.lastValid = { x: spawn.x, y: spawn.y };

      cfg.onEnter?.(scene);
      primeInteriorLinkState(scene);
      enterMultiplayerZone(interiorId, spawn.x, spawn.y, scene.playerState?.level);
      showToast?.(cfg.enterToast);
    },
    { centerInterior: true }
  );

  bindInteriorClickToMove(scene);
  return true;
}

/** Cambia de instancia ligada (pisos Peleteiro) sen saír ao mapa. */
export function switchLinkedInterior(scene, nextId, showToast, opts = {}) {
  if (scene.interiorTransition || scene.inBattle) return false;
  const nextCfg = getInteriorConfig(nextId);
  if (!nextCfg) return false;

  runTransition(
    scene,
    () => {
      const prevCfg = scene.interiorConfig;
      prevCfg?.onExit?.(scene);

      scene.interiorLayer?.destroy(true);
      scene.interiorLayer = scene.add.container(0, 0);
      scene.interiorLayer.setDepth(5);

      const gfx = buildInteriorGraphics(scene, nextCfg, nextId);
      scene.interiorLayer.add([
        gfx.floor,
        gfx.walls,
        gfx.label,
        ...gfx.stairTexts,
        ...gfx.zoneTexts,
        ...(gfx.propSprites || []),
      ]);

      scene.interiorZone = nextId;
      scene.interiorConfig = nextCfg;
      scene.mapBounds = { width: nextCfg.width, height: nextCfg.height };
      scene.interiorCollision = makeCollision(nextCfg);
      resetCameraPanState(scene);

      const spawn = nextCfg.getSpawnForLink?.(opts.via) ?? nextCfg.getEntrySpawn();
      scene.player.setPosition(spawn.x, spawn.y);
      resetMovementState(scene);
      scene.lastValid = { x: spawn.x, y: spawn.y };

      nextCfg.onEnter?.(scene);
      primeInteriorLinkState(scene);
      enterMultiplayerZone(nextId, spawn.x, spawn.y, scene.playerState?.level);
      showToast?.(nextCfg.enterToast);
    },
    { centerInterior: true }
  );

  return true;
}

/** @deprecated Usa enterInterior(scene, CATHEDRAL_ZONE_ID, showToast) */
export function enterCathedralInterior(scene, showToast) {
  return enterInterior(scene, CATHEDRAL_ZONE_ID, showToast);
}

function applyExitToOverworld(scene, ret, showToast) {
  const cfg = getInteriorConfig(scene.interiorZone);
  cfg?.onExit?.(scene);

  scene.interiorLayer?.destroy(true);
  scene.interiorLayer = null;
  scene.interiorZone = null;
  scene.interiorConfig = null;
  scene.interiorCollision = null;
  clearInteriorNavigation(scene);
  resetCameraPanState(scene);

  scene.mapBounds = ret.mapBounds;
  scene.player.setPosition(ret.x, ret.y);
  resetMovementState(scene);
  scene.lastValid = { x: ret.x, y: ret.y };

  setOverworldVisible(scene, true);

  const cam = scene.cameras.main;
  cam.stopFollow();
  cam.setBounds(0, 0, ret.mapBounds.width, ret.mapBounds.height);
  cam.setZoom(ret.zoom ?? 1.2);
  cam.centerOn(ret.x, ret.y);
  cam.startFollow(scene.player, true, 0.42, 0.42);

  scene.tileManager?.update();
  enterMultiplayerZone('world', ret.x, ret.y, scene.playerState?.level);
  showToast?.(ret.exitToast || 'Saíches ao mapa');
}

export function exitInterior(scene, showToast, opts = {}) {
  if (!scene.interiorZone || scene.interiorTransition) return false;

  const ret = scene._overworldReturn;
  if (!ret) return false;

  if (opts.immediate) {
    applyExitToOverworld(scene, ret, null);
    scene._overworldReturn = null;
    return true;
  }

  runTransition(scene, () => {
    applyExitToOverworld(scene, ret, showToast);
    scene._overworldReturn = null;
  });

  return true;
}

/** @deprecated Usa exitInterior */
export function exitCathedralInterior(scene, showToast, opts = {}) {
  if (scene.interiorZone !== CATHEDRAL_ZONE_ID) return exitInterior(scene, showToast, opts);
  return exitInterior(scene, showToast, opts);
}

export function updateInteriorZone(scene, delta, showToast, onPriestBattleEnd) {
  if (!scene.interiorZone || !scene.interiorConfig) return false;

  const cfg = scene.interiorConfig;
  const moved = updateInteriorMovement(scene, delta, scene.interiorCollision);
  if (moved) {
    notifyPlayerMoved(scene);
    const { dx, dy } = getLastMoveDelta(scene);
    updateWalkAnim(scene.player, dx, dy, scene, 'player');
    scene._moveSendAcc = (scene._moveSendAcc || 0) + delta;
    if (scene.mpEnabled && scene._moveSendAcc >= 80) {
      scene._moveSendAcc = 0;
      sendInteriorPosition(scene.player.x, scene.player.y, scene.playerState?.level);
    }
  }

  cfg.onUpdate?.(scene, delta, showToast, onPriestBattleEnd);

  const p = scene.player;
  const { tx, ty } = tileCharAtWorld(cfg, p.x, p.y);
  if (cfg.shouldExit?.(scene, tx, ty, p)) {
    exitInterior(scene, showToast);
  }

  return true;
}

export {
  CATHEDRAL_ZONE_ID,
  BAR_MOMO_ZONE_ID,
  RIQUELA_ZONE_ID,
  MODUS_VIVENDI_ZONE_ID,
  AREA_CENTRAL_ZONE_ID,
  ESTACION_TREN_ZONE_ID,
} from './interiors/index.js';
