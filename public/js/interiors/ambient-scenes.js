/** Escenas ambientais (sen icono na cabeza): propósito visual, non combate. */

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

export function updateAmbientScenes(state, now) {
  for (const item of state.ambientItems) {
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
  }
  state.ambientItems = [];
}
