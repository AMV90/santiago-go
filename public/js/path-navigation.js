import { MOVE_MAX_SPEED, PATH_WAYPOINT_RADIUS } from './config.js';
import { fetchPath } from './game-api.js';

export function setNavigationPath(scene, waypoints, destination) {
  scene.navPath = waypoints;
  scene.navIndex = 0;
  scene.navDestination = destination;
  if (scene.moveState) {
    scene.moveState.vx = 0;
    scene.moveState.vy = 0;
  }
}

export function clearNavigation(scene) {
  scene.navPath = null;
  scene.navIndex = 0;
  scene.navDestination = null;
}

export function hasActiveNavigation(scene) {
  return Boolean(scene.navPath?.length);
}

/**
 * Segue waypoints pola rúa (movemento dirixido, sen deriva lateral).
 */
export function updateNavigationMovement(scene, delta) {
  const p = scene.player;
  if (!p || !scene.streetWalker || !scene.navPath?.length) return false;

  const dt = Math.min(delta / 1000, 0.032);
  const b = scene.mapBounds;

  while (scene.navIndex < scene.navPath.length) {
    const wp = scene.navPath[scene.navIndex];
    const dx = wp.x - p.x;
    const dy = wp.y - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= PATH_WAYPOINT_RADIUS) {
      scene.navIndex++;
      continue;
    }

    const step = Math.min(MOVE_MAX_SPEED * dt, dist);
    const ndx = (dx / dist) * step;
    const ndy = (dy / dist) * step;

    const prevX = p.x;
    const prevY = p.y;
    const next = scene.streetWalker.moveOnStreet(p.x, p.y, ndx, ndy);
    const clamped = scene.streetWalker.clampToStreet(next.x, next.y);
    clamped.x = Phaser.Math.Clamp(clamped.x, 8, b.width - 8);
    clamped.y = Phaser.Math.Clamp(clamped.y, 8, b.height - 8);

    if (clamped.x !== p.x || clamped.y !== p.y) {
      p.setPosition(clamped.x, clamped.y);
      scene.lastValid = { x: clamped.x, y: clamped.y };
      scene._lastMoveDx = clamped.x - prevX;
      scene._lastMoveDy = clamped.y - prevY;
      return true;
    }

    scene.navIndex++;
  }

  clearNavigation(scene);
  return false;
}

export async function requestNavigateTo(scene, worldX, worldY) {
  if (!scene.player) return;

  try {
    const result = await fetchPath(scene.player.x, scene.player.y, worldX, worldY);
    if (!result.path?.length) {
      showNavToast(result.error || 'Sen ruta');
      return;
    }
    setNavigationPath(scene, result.path, result.destination);
    const dist = pathLength(result.path);
    showNavToast(`Ruta: ${Math.round(dist)} px`);
  } catch (err) {
    showNavToast(err.message || 'Erro de ruta');
  }
}

function pathLength(path) {
  let t = 0;
  for (let i = 1; i < path.length; i++) {
    t += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }
  return t;
}

function showNavToast(msg) {
  let el = document.getElementById('world-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(showNavToast._t);
  showNavToast._t = setTimeout(() => el.classList.remove('visible'), 2800);
}
