import { STREET_WALK_RADIUS, STREET_GRID_CELL } from './config.js';

function distToSegmentSq(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const ab2 = abx * abx + aby * aby;
  let t = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function cellKey(cx, cy) {
  return `${cx},${cy}`;
}

export function buildStreetWalker(streets) {
  const grid = new Map();
  const cell = STREET_GRID_CELL;
  const radiusSq = STREET_WALK_RADIUS * STREET_WALK_RADIUS;
  const innerRadiusSq = radiusSq * 0.72 * 0.72;

  for (const street of streets) {
    const pts = street.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const minCx = Math.floor(Math.min(a.x, b.x) / cell) - 1;
      const maxCx = Math.floor(Math.max(a.x, b.x) / cell) + 1;
      const minCy = Math.floor(Math.min(a.y, b.y) / cell) - 1;
      const maxCy = Math.floor(Math.max(a.y, b.y) / cell) + 1;
      const seg = { ax: a.x, ay: a.y, bx: b.x, by: b.y };
      for (let cx = minCx; cx <= maxCx; cx++) {
        for (let cy = minCy; cy <= maxCy; cy++) {
          const k = cellKey(cx, cy);
          if (!grid.has(k)) grid.set(k, []);
          grid.get(k).push(seg);
        }
      }
    }
  }

  function querySegments(x, y, ring = 1) {
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const out = [];
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dy = -ring; dy <= ring; dy++) {
        const segs = grid.get(cellKey(cx + dx, cy + dy));
        if (segs) out.push(...segs);
      }
    }
    return out;
  }

  function isWalkable(x, y, radiusSqOverride = radiusSq) {
    const segs = querySegments(x, y, 1);
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (distToSegmentSq(x, y, s.ax, s.ay, s.bx, s.by) <= radiusSqOverride) return true;
    }
    return false;
  }

  function snapToStreet(x, y) {
    const segs = querySegments(x, y, 2);
    let bestX = x;
    let bestY = y;
    let bestD = Infinity;
    for (const s of segs) {
      const abx = s.bx - s.ax;
      const aby = s.by - s.ay;
      const apx = x - s.ax;
      const apy = y - s.ay;
      const ab2 = abx * abx + aby * aby;
      let t = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
      t = Math.max(0, Math.min(1, t));
      const px = s.ax + t * abx;
      const py = s.ay + t * aby;
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < bestD) {
        bestD = d;
        bestX = px;
        bestY = py;
      }
    }
    return { x: bestX, y: bestY };
  }

  /** Mantén o personaxe no eixe da rúa (sen “deriva” ampla). */
  function clampToStreet(x, y) {
    if (isWalkable(x, y, innerRadiusSq)) return { x, y };
    return snapToStreet(x, y);
  }

  /** Movemento estrito: só pasos válidos sobre a rúa, sen modo suave nin slide libre. */
  function moveOnStreet(x, y, dx, dy) {
    const mag = Math.hypot(dx, dy);
    if (mag < 0.001) return { x, y };

    const tryStep = (sx, sy) => {
      if (!isWalkable(sx, sy)) return null;
      return clampToStreet(sx, sy);
    };

    let hit = tryStep(x + dx, y + dy);
    if (hit) return hit;

    if (Math.abs(dx) > 0.01) {
      hit = tryStep(x + dx, y);
      if (hit) return hit;
    }
    if (Math.abs(dy) > 0.01) {
      hit = tryStep(x, y + dy);
      if (hit) return hit;
    }

    return { x, y };
  }

  return { isWalkable, moveOnStreet, snapToStreet, clampToStreet, querySegments };
}
