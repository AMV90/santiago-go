import {
  MOVE_ACCEL,
  MOVE_DECEL,
  MOVE_MAX_SPEED,
  MOVE_SUBSTEP_MAX_PX,
  MOVE_TURN_SNAP,
} from './config.js';
import { createMovementState } from './movement-controller.js';
import { clearNavigation } from './path-navigation.js';
import {
  clearInteriorNavigation,
  getInteriorNavWaypoint,
} from './interiors/interior-pathfinding.js';
import { isChatOpen } from './chat-input.js';

/**
 * Movemento libre con colisión por tiles (interiores tipo Pokémon).
 */
export function updateInteriorMovement(scene, delta, collisionFn) {
  if (isChatOpen()) return false;

  const p = scene.player;
  if (!p || !collisionFn) return false;

  const dt = Math.min(delta / 1000, 0.032);
  if (!scene.moveState) scene.moveState = createMovementState();
  const mv = scene.moveState;

  // Direccion manual (WASD/cursores) ou por clic en destino (tipo Pokémon).
  let ix = 0;
  let iy = 0;

  const manual = hasManualInput(scene);

  if (manual) {
    if (scene.cursors.left.isDown || scene.wasd.A.isDown) ix -= 1;
    else if (scene.cursors.right.isDown || scene.wasd.D.isDown) ix += 1;
    if (scene.cursors.up.isDown || scene.wasd.W.isDown) iy -= 1;
    else if (scene.cursors.down.isDown || scene.wasd.S.isDown) iy += 1;
    clearInteriorNavigation(scene);
  } else {
    const wp = getInteriorNavWaypoint(scene);
    if (wp) {
      const dx = wp.x - p.x;
      const dy = wp.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5) {
        ix = dx / dist;
        iy = dy / dist;
      }
    }
  }

  const hasInput = ix !== 0 || iy !== 0;
  if (manual) clearNavigation(scene);

  if (hasInput) {
    const len = Math.hypot(ix, iy);
    mv.dirX = ix / len;
    mv.dirY = iy / len;
  }

  const targetVx = hasInput ? mv.dirX * MOVE_MAX_SPEED * 0.72 : 0;
  const targetVy = hasInput ? mv.dirY * MOVE_MAX_SPEED * 0.72 : 0;
  const rate = hasInput ? MOVE_ACCEL : MOVE_DECEL;

  mv.vx = moveToward(mv.vx, targetVx, rate * dt);
  mv.vy = moveToward(mv.vy, targetVy, rate * dt);

  if (!hasInput) {
    const speed = Math.hypot(mv.vx, mv.vy);
    if (speed < MOVE_TURN_SNAP) {
      mv.vx = 0;
      mv.vy = 0;
      return false;
    }
  }

  const speed = Math.hypot(mv.vx, mv.vy);
  if (speed < 1) return false;

  const dist = speed * dt;
  const steps = Math.max(3, Math.ceil(dist / MOVE_SUBSTEP_MAX_PX));
  const b = scene.mapBounds;
  let moved = false;
  let lastDx = 0;
  let lastDy = 0;
  const radius = 7;

  for (let s = 0; s < steps; s++) {
    const subDx = (mv.vx * dt) / steps;
    const subDy = (mv.vy * dt) / steps;
    if (Math.abs(subDx) < 0.01 && Math.abs(subDy) < 0.01) continue;

    const prevX = p.x;
    const prevY = p.y;
    let nx = prevX + subDx;
    let ny = prevY + subDy;

    nx = Phaser.Math.Clamp(nx, radius, b.width - radius);
    ny = Phaser.Math.Clamp(ny, radius, b.height - radius);

    if (!collisionFn(nx, ny, radius)) {
      p.setPosition(nx, ny);
      moved = true;
      lastDx = nx - prevX;
      lastDy = ny - prevY;
      scene.lastValid = { x: nx, y: ny };
    } else {
      const tryX = collisionFn(prevX + subDx, prevY, radius)
        ? prevX
        : Phaser.Math.Clamp(prevX + subDx, radius, b.width - radius);
      const tryY = collisionFn(tryX, prevY + subDy, radius)
        ? prevY
        : Phaser.Math.Clamp(prevY + subDy, radius, b.height - radius);
      if (!collisionFn(tryX, tryY, radius)) {
        p.setPosition(tryX, tryY);
        moved = true;
        lastDx = tryX - prevX;
        lastDy = tryY - prevY;
        scene.lastValid = { x: tryX, y: tryY };
      }
      mv.vx *= 0.2;
      mv.vy *= 0.2;
    }
  }

  if (moved) {
    scene._lastMoveDx = lastDx;
    scene._lastMoveDy = lastDy;
  }
  return moved;
}

function hasManualInput(scene) {
  return (
    scene.cursors.left.isDown ||
    scene.cursors.right.isDown ||
    scene.cursors.up.isDown ||
    scene.cursors.down.isDown ||
    scene.wasd.A.isDown ||
    scene.wasd.D.isDown ||
    scene.wasd.W.isDown ||
    scene.wasd.S.isDown
  );
}

function moveToward(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return current;
}
