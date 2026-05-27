/**
 * Minimapa circular (~10 km). Clic → ruta no servidor.
 */
import { metersPerPixel } from './geo.js';
import { requestNavigateTo } from './path-navigation.js';
import { isBattleOpen } from './battle-ui.js';
import { fetchMinimapStreets } from './game-api.js';

const CANVAS_W = 128;
const CANVAS_H = 128;
/** Radio en metros (diámetro ~10 km) */
const RADIUS_M = 5000;

export function createMinimap(mapData, scene) {
  const wrap = document.getElementById('game-minimap');
  const canvas = document.getElementById('minimap-canvas');
  if (!wrap || !canvas || !scene) return null;

  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const mpp = metersPerPixel(mapData);
  const radiusPx = RADIUS_M / mpp.avg;

  let minimapStreets = [];
  let lastFetch = 0;
  let fetchPending = false;

  const NAMED = '#f4d35e';
  const UNNAMED = '#6d7d8f';

  async function refreshMinimapStreets(px, py) {
    if (fetchPending) return;
    const now = Date.now();
    if (now - lastFetch < 2500) return;
    fetchPending = true;
    try {
      const data = await fetchMinimapStreets(px, py, RADIUS_M);
      minimapStreets = data.streets || [];
      lastFetch = now;
    } catch {
      /* mantén o anterior */
    } finally {
      fetchPending = false;
    }
  }

  function draw(scene) {
    if (!scene?.player) return;

    refreshMinimapStreets(scene.player.x, scene.player.y);

    const px = scene.player.x;
    const py = scene.player.y;
    const scale = CANVAS_W / (radiusPx * 2);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const radiusCanvas = CANVAS_W / 2 - 2;
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    ctx.fillStyle = '#1a2420';
    ctx.beginPath();
    ctx.arc(cx, cy, radiusCanvas, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, radiusCanvas - 3, 0, Math.PI * 2);
    ctx.clip();
    ctx.lineWidth = 0.8;

    for (let i = 0; i < minimapStreets.length; i++) {
      const street = minimapStreets[i];
      const pts = street.points;
      if (!pts || pts.length < 2) continue;

      let inView = false;
      for (let j = 0; j < pts.length; j++) {
        const dx = pts[j].x - px;
        const dy = pts[j].y - py;
        if (dx * dx + dy * dy <= radiusPx * radiusPx * 1.15) {
          inView = true;
          break;
        }
      }
      if (!inView) continue;

      ctx.strokeStyle = street.name ? NAMED : UNNAMED;
      ctx.globalAlpha = street.name ? 0.85 : 0.5;
      ctx.beginPath();
      const p0 = pts[0];
      ctx.moveTo((p0.x - px) * scale, (p0.y - py) * scale);
      for (let j = 1; j < pts.length; j++) {
        ctx.lineTo((pts[j].x - px) * scale, (pts[j].y - py) * scale);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (scene.navPath?.length > 1) {
      ctx.strokeStyle = '#7bed9f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const s0 = scene.navPath[0];
      ctx.moveTo((s0.x - px) * scale, (s0.y - py) * scale);
      for (let k = 1; k < scene.navPath.length; k++) {
        const p = scene.navPath[k];
        if (Math.hypot(p.x - px, p.y - py) > radiusPx * 1.2) continue;
        ctx.lineTo((p.x - px) * scale, (p.y - py) * scale);
      }
      ctx.stroke();
    }

    if (scene.navDestination) {
      const d = scene.navDestination;
      const dx = (d.x - px) * scale;
      const dy = (d.y - py) * scale;
      if (Math.hypot(dx, dy) <= radiusPx) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (scene.remoteSprites?.size) {
      for (const [, spr] of scene.remoteSprites) {
        const dx = (spr.x - px) * scale;
        const dy = (spr.y - py) * scale;
        if (Math.hypot(dx, dy) > radiusPx) continue;
        ctx.fillStyle = '#e040fb';
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#61beff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    ctx.strokeStyle = 'rgba(244, 211, 94, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radiusCanvas, 0, Math.PI * 2);
    ctx.stroke();
  }

  wrap.addEventListener('click', (ev) => {
    if (!scene.player || scene.inBattle || isBattleOpen()) return;

    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = CANVAS_W / 2 - 2;

    if (dx * dx + dy * dy > r * r) return;

    const scale = CANVAS_W / (radiusPx * 2);
    const destX = scene.player.x + dx / scale;
    const destY = scene.player.y + dy / scale;

    requestNavigateTo(scene, destX, destY);
  });

  return { draw, destroy() {} };
}

export function destroyMinimap(instance) {
  instance?.destroy?.();
}
