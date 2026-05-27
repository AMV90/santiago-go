/**
 * A* sobre a cuadrícula de tiles dun interior (camino máis curto esquivando obstáculos).
 */

const WAYPOINT_RADIUS = 10;

function tileKey(tx, ty) {
  return `${tx},${ty}`;
}

function worldToTile(cfg, x, y) {
  return {
    tx: Math.floor(x / cfg.tileSize),
    ty: Math.floor(y / cfg.tileSize),
  };
}

function tileCenter(cfg, tx, ty) {
  const ts = cfg.tileSize;
  return { x: tx * ts + ts / 2, y: ty * ts + ts / 2 };
}

function isWalkableTile(cfg, tx, ty) {
  return !cfg.isBlocked(cfg.getTileAt(tx, ty));
}

function nearestWalkable(cfg, tx, ty, maxRadius = 14) {
  if (isWalkableTile(cfg, tx, ty)) return { tx, ty };

  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = tx + dx;
        const ny = ty + dy;
        if (isWalkableTile(cfg, nx, ny)) return { tx: nx, ty: ny };
      }
    }
  }
  return null;
}

function heuristic(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function reconstructPath(cfg, cameFrom, endKey, endTx, endTy) {
  const tiles = [{ tx: endTx, ty: endTy }];
  let k = endKey;
  while (cameFrom.has(k)) {
    const prev = cameFrom.get(k);
    tiles.unshift(prev);
    k = tileKey(prev.tx, prev.ty);
  }
  return simplifyPath(tiles.map((t) => tileCenter(cfg, t.tx, t.ty)));
}

/** Elimina waypoints redundantes en liñas rectas horizontais/verticais */
function simplifyPath(points) {
  if (points.length <= 2) return points;

  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const c = points[i + 1];
    const sameRow = Math.abs(a.y - b.y) < 0.1 && Math.abs(b.y - c.y) < 0.1;
    const sameCol = Math.abs(a.x - b.x) < 0.1 && Math.abs(b.x - c.x) < 0.1;
    if (sameRow || sameCol) continue;
    out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * @returns {Array<{x:number,y:number}>|null}
 */
export function findInteriorPath(cfg, fromX, fromY, toX, toY) {
  const startTile = worldToTile(cfg, fromX, fromY);
  const goalTile = worldToTile(cfg, toX, toY);

  const start = nearestWalkable(cfg, startTile.tx, startTile.ty);
  const goal = nearestWalkable(cfg, goalTile.tx, goalTile.ty);
  if (!start || !goal) return null;

  if (start.tx === goal.tx && start.ty === goal.ty) {
    return [tileCenter(cfg, goal.tx, goal.ty)];
  }

  const open = [];
  const gScore = new Map();
  const cameFrom = new Map();
  const closed = new Set();

  const startKey = tileKey(start.tx, start.ty);
  gScore.set(startKey, 0);
  open.push({ tx: start.tx, ty: start.ty, f: heuristic(start.tx, start.ty, goal.tx, goal.ty) });

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    const ck = tileKey(cur.tx, cur.ty);
    if (closed.has(ck)) continue;
    closed.add(ck);

    if (cur.tx === goal.tx && cur.ty === goal.ty) {
      return reconstructPath(cfg, cameFrom, ck, cur.tx, cur.ty);
    }

    const curG = gScore.get(ck) ?? Infinity;

    for (const [dx, dy] of dirs) {
      const nx = cur.tx + dx;
      const ny = cur.ty + dy;
      if (!isWalkableTile(cfg, nx, ny)) continue;

      const nk = tileKey(nx, ny);
      const tg = curG + 1;
      if (tg >= (gScore.get(nk) ?? Infinity)) continue;

      cameFrom.set(nk, { tx: cur.tx, ty: cur.ty });
      gScore.set(nk, tg);
      open.push({ tx: nx, ty: ny, f: tg + heuristic(nx, ny, goal.tx, goal.ty) });
    }
  }

  return null;
}

export function setInteriorNavigation(scene, path) {
  scene._interiorNavPath = path?.length ? path : null;
  scene._interiorNavIndex = 0;
  scene._interiorNavTarget = null;
  if (scene.moveState) {
    scene.moveState.vx = 0;
    scene.moveState.vy = 0;
  }
}

export function clearInteriorNavigation(scene) {
  scene._interiorNavPath = null;
  scene._interiorNavIndex = 0;
  scene._interiorNavTarget = null;
}

export function hasInteriorNavigation(scene) {
  return Boolean(scene._interiorNavPath?.length);
}

export function requestInteriorNavigate(scene, worldX, worldY) {
  const cfg = scene.interiorConfig;
  if (!cfg || !scene.player) return false;

  const path = findInteriorPath(cfg, scene.player.x, scene.player.y, worldX, worldY);
  if (!path?.length) return false;

  setInteriorNavigation(scene, path);
  return true;
}

export function getInteriorNavWaypoint(scene) {
  if (!scene._interiorNavPath?.length) return null;

  const p = scene.player;
  while (scene._interiorNavIndex < scene._interiorNavPath.length) {
    const wp = scene._interiorNavPath[scene._interiorNavIndex];
    const dist = Math.hypot(wp.x - p.x, wp.y - p.y);
    if (dist <= WAYPOINT_RADIUS) {
      scene._interiorNavIndex++;
      continue;
    }
    return wp;
  }

  clearInteriorNavigation(scene);
  return null;
}

export { WAYPOINT_RADIUS as INTERIOR_WAYPOINT_RADIUS };
