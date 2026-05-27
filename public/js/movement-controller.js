import {
  MOVE_ACCEL,
  MOVE_DECEL,
  MOVE_MAX_SPEED,
  MOVE_SUBSTEP_MAX_PX,
  MOVE_TURN_SNAP,
} from './config.js';
import {
  clearNavigation,
  hasActiveNavigation,
  updateNavigationMovement,
} from './path-navigation.js';
import { isChatOpen } from './chat-input.js';

export function createMovementState() {
  return { vx: 0, vy: 0, dirX: 0, dirY: 1 };
}

function moveToward(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return current;
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

/**
 * Movemento con inercia, pegado á rúa e navegación por minimapa.
 */
export function updatePlayerMovement(scene, delta) {
  if (isChatOpen()) return false;

  const p = scene.player;
  if (!p || !scene.streetWalker) return false;

  if (hasManualInput(scene)) {
    clearNavigation(scene);
  } else if (hasActiveNavigation(scene)) {
    return updateNavigationMovement(scene, delta);
  }

  const dt = Math.min(delta / 1000, 0.032);
  if (!scene.moveState) scene.moveState = createMovementState();
  const mv = scene.moveState;

  let ix = 0;
  let iy = 0;
  if (scene.cursors.left.isDown || scene.wasd.A.isDown) ix -= 1;
  else if (scene.cursors.right.isDown || scene.wasd.D.isDown) ix += 1;
  if (scene.cursors.up.isDown || scene.wasd.W.isDown) iy -= 1;
  else if (scene.cursors.down.isDown || scene.wasd.S.isDown) iy += 1;

  const hasInput = ix !== 0 || iy !== 0;

  if (hasInput) {
    const len = Math.hypot(ix, iy);
    mv.dirX = ix / len;
    mv.dirY = iy / len;
  }

  const targetVx = hasInput ? mv.dirX * MOVE_MAX_SPEED : 0;
  const targetVy = hasInput ? mv.dirY * MOVE_MAX_SPEED : 0;
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

  for (let s = 0; s < steps; s++) {
    const subDx = (mv.vx * dt) / steps;
    const subDy = (mv.vy * dt) / steps;
    if (Math.abs(subDx) < 0.01 && Math.abs(subDy) < 0.01) continue;

    const prevX = p.x;
    const prevY = p.y;
    const next = scene.streetWalker.moveOnStreet(p.x, p.y, subDx, subDy);
    const clamped = scene.streetWalker.clampToStreet(next.x, next.y);
    clamped.x = Phaser.Math.Clamp(clamped.x, 8, b.width - 8);
    clamped.y = Phaser.Math.Clamp(clamped.y, 8, b.height - 8);

    const actualDx = clamped.x - prevX;
    const actualDy = clamped.y - prevY;

    if (actualDx !== 0 || actualDy !== 0) {
      p.setPosition(clamped.x, clamped.y);
      moved = true;
      lastDx = actualDx;
      lastDy = actualDy;
      if (scene.streetWalker.isWalkable(clamped.x, clamped.y)) {
        scene.lastValid = { x: clamped.x, y: clamped.y };
      }
    }

    if (Math.abs(actualDx) < Math.abs(subDx) * 0.2) mv.vx *= 0.25;
    if (Math.abs(actualDy) < Math.abs(subDy) * 0.2) mv.vy *= 0.25;
  }

  if (moved) {
    scene._lastMoveDx = lastDx;
    scene._lastMoveDy = lastDy;
  }

  return moved;
}

export function getLastMoveDelta(scene) {
  return { dx: scene._lastMoveDx || 0, dy: scene._lastMoveDy || 0 };
}

export function resetMovementState(scene) {
  if (scene.moveState) {
    scene.moveState.vx = 0;
    scene.moveState.vy = 0;
  }
  clearNavigation(scene);
}
