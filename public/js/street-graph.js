/**
 * Grafo de rúas para pathfinding (A*).
 */
const NODE_GRID = 20;
const NEAREST_NODE_RING = 4;

export function buildStreetGraph(streets) {
  /** @type {Map<string, { id: number, x: number, y: number }>} */
  const nodeByKey = new Map();
  /** @type {Map<number, { to: number, w: number }[]>} */
  const adj = new Map();
  /** @type {Map<string, number[]>} */
  const spatial = new Map();
  let nextId = 0;

  function cellKey(x, y) {
    return `${Math.floor(x / NODE_GRID)},${Math.floor(y / NODE_GRID)}`;
  }

  function registerSpatial(n) {
    const k = cellKey(n.x, n.y);
    if (!spatial.has(k)) spatial.set(k, []);
    spatial.get(k).push(n.id);
  }

  function getNode(x, y) {
    const gx = Math.round(x / NODE_GRID) * NODE_GRID;
    const gy = Math.round(y / NODE_GRID) * NODE_GRID;
    const key = `${gx},${gy}`;
    if (!nodeByKey.has(key)) {
      const node = { id: nextId++, x: gx, y: gy };
      nodeByKey.set(key, node);
      adj.set(node.id, []);
      registerSpatial(node);
    }
    return nodeByKey.get(key);
  }

  function addEdge(a, b) {
    if (a.id === b.id) return;
    const w = Math.hypot(a.x - b.x, a.y - b.y);
    if (w < 1) return;

    const listA = adj.get(a.id);
    if (!listA.some((e) => e.to === b.id)) listA.push({ to: b.id, w });
    const listB = adj.get(b.id);
    if (!listB.some((e) => e.to === a.id)) listB.push({ to: a.id, w });
  }

  for (const street of streets) {
    const pts = street.points;
    if (!pts || pts.length < 2) continue;
    let prev = getNode(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cur = getNode(pts[i].x, pts[i].y);
      addEdge(prev, cur);
      prev = cur;
    }
  }

  /** @type {Map<number, { id: number, x: number, y: number }>} */
  const nodesById = new Map(
    Array.from(nodeByKey.values(), (n) => [n.id, n])
  );

  function nearestNodeId(x, y, maxDist = 120) {
    const cx = Math.floor(x / NODE_GRID);
    const cy = Math.floor(y / NODE_GRID);
    let bestId = -1;
    let bestD = maxDist * maxDist;

    for (let ring = 0; ring <= NEAREST_NODE_RING; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dy = -ring; dy <= ring; dy++) {
          if (ring > 0 && Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;
          const ids = spatial.get(`${cx + dx},${cy + dy}`);
          if (!ids) continue;
          for (const id of ids) {
            const n = nodesById.get(id);
            if (!n) continue;
            const d = (n.x - x) ** 2 + (n.y - y) ** 2;
            if (d < bestD) {
              bestD = d;
              bestId = id;
            }
          }
        }
      }
      if (bestId >= 0) return bestId;
    }
    return bestId;
  }

  function findPath(fromX, fromY, toX, toY) {
    const startId = nearestNodeId(fromX, fromY, 180);
    const endId = nearestNodeId(toX, toY, 180);
    if (startId < 0 || endId < 0) return null;
    if (startId === endId) {
      return [
        { x: fromX, y: fromY },
        { x: toX, y: toY },
      ];
    }

    const endNode = nodesById.get(endId);
    const h = (id) => {
      const n = nodesById.get(id);
      return Math.hypot(n.x - endNode.x, n.y - endNode.y);
    };

    const open = new MinHeap((id) => fScore.get(id) ?? Infinity);
    const closed = new Set();
    const cameFrom = new Map();
    const gScore = new Map([[startId, 0]]);
    const fScore = new Map([[startId, h(startId)]]);
    open.push(startId);

    const MAX_EXPLORE = 32000;
    let explored = 0;

    while (open.size) {
      if (++explored > MAX_EXPLORE) return null;

      const current = open.pop();
      if (closed.has(current)) continue;
      if (current === endId) {
        const ids = [];
        let c = current;
        while (c !== undefined) {
          ids.push(c);
          c = cameFrom.get(c);
        }
        ids.reverse();
        const waypoints = ids.map((id) => {
          const n = nodesById.get(id);
          return { x: n.x, y: n.y };
        });
        if (waypoints.length) {
          waypoints[0] = { x: fromX, y: fromY };
          waypoints[waypoints.length - 1] = { x: toX, y: toY };
        }
        return simplifyPath(waypoints);
      }

      closed.add(current);
      const neighbors = adj.get(current) || [];
      for (const { to, w } of neighbors) {
        if (closed.has(to)) continue;
        const tg = (gScore.get(current) ?? Infinity) + w;
        if (tg >= (gScore.get(to) ?? Infinity)) continue;
        cameFrom.set(to, current);
        gScore.set(to, tg);
        fScore.set(to, tg + h(to));
        open.push(to);
      }
    }

    return null;
  }

  return { nodeCount: nodesById.size, findPath, nearestNodeId };
}

function simplifyPath(points) {
  if (points.length <= 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const c = points[i + 1];
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(cross) > 8) out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

/** Cola de prioridade mínima para A* (evita open.sort cada iteración). */
class MinHeap {
  constructor(scoreFn) {
    this.data = [];
    this.scoreFn = scoreFn;
  }

  get size() {
    return this.data.length;
  }

  push(item) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop() {
    if (!this.data.length) return undefined;
    const top = this.data[0];
    const tail = this.data.pop();
    if (this.data.length) {
      this.data[0] = tail;
      this.bubbleDown(0);
    }
    return top;
  }

  bubbleUp(i) {
    const d = this.data;
    const score = this.scoreFn;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (score(d[i]) >= score(d[parent])) break;
      [d[i], d[parent]] = [d[parent], d[i]];
      i = parent;
    }
  }

  bubbleDown(i) {
    const d = this.data;
    const score = this.scoreFn;
    const n = d.length;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && score(d[left]) < score(d[smallest])) smallest = left;
      if (right < n && score(d[right]) < score(d[smallest])) smallest = right;
      if (smallest === i) break;
      [d[i], d[smallest]] = [d[smallest], d[i]];
      i = smallest;
    }
  }
}
