/** Escenas ambientais (sen icono na cabeza): propósito visual, non combate. */

import { ensureCasinaMalinoisAnims, malinoisWalkAnimKey, MALINOIS_WALK_DIRS } from './casina-malinois-sprites.js';

function playMalinoisFacing(spr, textureKey, facing, { idle = false } = {}) {
  spr.setFlipX(false);
  if (idle) {
    spr.anims.stop();
    spr.setFrame(MALINOIS_WALK_DIRS.down.start);
    return;
  }
  const animKey = malinoisWalkAnimKey(textureKey, facing);
  if (spr.anims.currentAnim?.key !== animKey) spr.play(animKey);
}

function malinoisMoveFacing(item) {
  if (item.axis === 'y') return item.dir > 0 ? 'down' : 'up';
  return item.dir > 0 ? 'right' : 'left';
}

function drawKidSmallTexture(g, variant = 0) {
  const shirt = variant === 0 ? 0x42a5f5 : 0xff8a65;
  g.fillStyle(shirt, 1);
  g.fillRect(4, 10, 8, 9);
  g.fillStyle(0xffdbac, 1);
  g.fillRect(5, 4, 6, 6);
  g.fillStyle(0x3e2723, 1);
  g.fillRect(5, 3, 6, 2);
  g.fillStyle(0x222222, 1);
  g.fillRect(5, 6, 2, 1);
  g.fillRect(8, 6, 2, 1);
  g.fillStyle(0x5d4037, 1);
  g.fillRect(4, 18, 3, 4);
  g.fillRect(9, 18, 3, 4);
}

export function ensureKidSmallTexture(scene) {
  if (scene.textures.exists('char-kid-small')) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawKidSmallTexture(g, 0);
  g.generateTexture('char-kid-small', 16, 22);
  g.destroy();
}

/**
 * Dous nenos xogando ao balón — debuxo no chan + sprites + balón animado.
 */
export function spawnKidsPlayingBall(scene, layout, def, state) {
  ensureKidSmallTexture(scene);
  const center = layout.tileToWorld(def.tx, def.ty);
  const cx = center.x;
  const cy = center.y;

  const floorGfx = scene.add.graphics();
  floorGfx.setDepth(20);
  floorGfx.fillStyle(0xffffff, 0.2);
  floorGfx.fillCircle(cx, cy + 6, 28);
  floorGfx.lineStyle(1, 0xffffff, 0.35);
  floorGfx.strokeCircle(cx, cy + 6, 28);

  const k1 = scene.add.sprite(cx - 22, cy + 6, 'char-kid-small');
  const k2 = scene.add.sprite(cx + 22, cy + 6, 'char-kid-small');
  k1.setTint(0x64b5f6);
  k2.setTint(0xffab91);
  k2.setFlipX(true);
  k1.setDepth(22);
  k2.setDepth(22);

  const ball = scene.add.graphics();
  ball.setDepth(23);

  state.ambientItems.push({
    kind: 'kidsPlayingBall',
    floorGfx,
    k1,
    k2,
    ball,
    cx,
    cy,
    phase: Math.random() * Math.PI * 2,
  });
}

/**
 * Pastor belga malinois (Forge) — patrulla entre dous puntos do pasillo ou parque.
 */
export function spawnMalinoisPatrol(scene, layout, def, state) {
  ensureCasinaMalinoisAnims(scene);
  const textureKey = def.textureKey || 'casina-malinois-1';
  if (!scene.textures.exists(textureKey)) return;

  const a = layout.tileToWorld(def.tx0, def.ty0 ?? def.ty);
  const b = layout.tileToWorld(def.tx1, def.ty1 ?? def.ty);
  const axis = def.ty0 != null && def.ty1 != null && def.ty0 !== def.ty1 ? 'y' : 'x';

  let x0;
  let x1;
  let y0;
  let y1;
  let startX;
  let startY;

  if (axis === 'y') {
    x0 = x1 = a.x;
    y0 = Math.min(a.y, b.y);
    y1 = Math.max(a.y, b.y);
    startX = a.x;
    startY = y0;
  } else {
    x0 = Math.min(a.x, b.x);
    x1 = Math.max(a.x, b.x);
    y0 = y1 = a.y + (def.yOffset ?? 4);
    startX = x0;
    startY = y0;
  }

  const spr = scene.add.sprite(startX, startY, textureKey, 0);
  spr.setOrigin(0.5, 0.82);
  spr.setScale(def.scale ?? 0.22);
  spr.setDepth(22);
  spr.play(malinoisWalkAnimKey(textureKey, 'down'));

  state.ambientItems.push({
    kind: 'malinoisPatrol',
    spr,
    textureKey,
    axis,
    x0,
    x1,
    y0,
    y1,
    dir: 1,
    speed: def.speed ?? 22,
    pauseMs: def.pauseMs ?? 900,
    pauseUntil: 0,
  });
}

function drawBall(gfx, x, y) {
  gfx.fillStyle(0xf5f5f5, 1);
  gfx.fillCircle(x, y, 5);
  gfx.lineStyle(1, 0x424242, 0.5);
  gfx.strokeCircle(x, y, 5);
  gfx.lineStyle(1, 0x757575, 0.45);
  gfx.beginPath();
  gfx.arc(x, y, 5, 0.2, Math.PI - 0.2, false);
  gfx.strokePath();
  gfx.beginPath();
  gfx.arc(x, y, 5, Math.PI + 0.2, -0.2, false);
  gfx.strokePath();
}

export function updateAmbientScenes(state, now, delta = 16) {
  for (const item of state.ambientItems) {
    if (item.kind === 'malinoisPatrol') {
      const spr = item.spr;
      if (!spr?.active) continue;

      if (now < item.pauseUntil) {
        playMalinoisFacing(spr, item.textureKey, 'down', { idle: true });
        continue;
      }

      const step = (item.speed * delta) / 1000;
      playMalinoisFacing(spr, item.textureKey, malinoisMoveFacing(item));

      if (item.axis === 'y') {
        spr.y += item.dir * step;
        if (spr.y >= item.y1) {
          spr.y = item.y1;
          item.dir = -1;
          item.pauseUntil = now + item.pauseMs;
        } else if (spr.y <= item.y0) {
          spr.y = item.y0;
          item.dir = 1;
          item.pauseUntil = now + item.pauseMs;
        }
      } else {
        spr.x += item.dir * step;
        if (spr.x >= item.x1) {
          spr.x = item.x1;
          item.dir = -1;
          item.pauseUntil = now + item.pauseMs;
        } else if (spr.x <= item.x0) {
          spr.x = item.x0;
          item.dir = 1;
          item.pauseUntil = now + item.pauseMs;
        }
      }
      continue;
    }

    if (item.kind !== 'kidsPlayingBall') continue;
    const t = now * 0.0035 + item.phase;
    const bounce = Math.sin(t);
    const side = Math.cos(t * 0.85);
    const bx = item.cx + side * 12;
    const by = item.cy - 4 - Math.abs(bounce) * 14;

    item.k1.x = item.cx - 22 - side * 2;
    item.k2.x = item.cx + 22 - side * 2;
    item.k1.y = item.cy + 6 + (bounce > 0 ? -1 : 0);
    item.k2.y = item.cy + 6 + (bounce > 0 ? -1 : 0);

    item.ball.clear();
    drawBall(item.ball, bx, by);
  }
}

export function destroyAmbientItems(state) {
  for (const item of state.ambientItems) {
    item.floorGfx?.destroy();
    item.k1?.destroy();
    item.k2?.destroy();
    item.ball?.destroy();
    item.gfx?.destroy();
    item.spr?.destroy();
  }
  state.ambientItems = [];
}
