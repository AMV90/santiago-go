/**
 * Etiquetas de xogadores remotos en HTML+SVG (tamaño fixo en pantalla, non escalan co zoom).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'santiago-go-show-nametags';

export function areNametagsVisible() {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function setNametagsVisible(on) {
  localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  syncNametagsToggleButton();
  const layer = document.getElementById('player-nametags-layer');
  if (layer) layer.classList.toggle('nametags-off', !on);
}

export function initNametagsToggle() {
  const btn = document.getElementById('toggle-nametags');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';
  syncNametagsToggleButton();
  setNametagsVisible(areNametagsVisible());
  btn.addEventListener('click', () => setNametagsVisible(!areNametagsVisible()));
}

function syncNametagsToggleButton() {
  const btn = document.getElementById('toggle-nametags');
  if (!btn) return;
  const on = areNametagsVisible();
  btn.classList.toggle('active', on);
  btn.textContent = on ? 'Ocultar nomes' : 'Mostrar nomes';
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
}

export function ensureNametagsLayer(scene) {
  if (scene.nametagsLayer?.isConnected) {
    scene.nametagsLayer.classList.toggle('nametags-off', !areNametagsVisible());
    return scene.nametagsLayer;
  }

  let layer = document.getElementById('player-nametags-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'player-nametags-layer';
    layer.className = 'player-nametags-layer nametags-off';
    layer.setAttribute('aria-hidden', 'true');
    document.getElementById('panel-game')?.appendChild(layer);
  }
  layer.classList.toggle('nametags-off', !areNametagsVisible());
  scene.nametagsLayer = layer;
  scene.remoteNametags = scene.remoteNametags || new Map();
  return layer;
}

export function createRemoteNametag(scene, id, name, level = 1) {
  ensureNametagsLayer(scene);
  destroyRemoteNametag(scene, id);

  const wrap = document.createElement('div');
  wrap.className = 'player-nametag';
  wrap.dataset.playerId = id;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'nametag-svg');
  svg.setAttribute('viewBox', '0 0 160 40');
  svg.setAttribute('width', '160');
  svg.setAttribute('height', '40');

  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('class', 'nametag-bg');
  bg.setAttribute('x', '2');
  bg.setAttribute('y', '2');
  bg.setAttribute('width', '156');
  bg.setAttribute('height', '30');
  bg.setAttribute('rx', '10');

  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('class', 'nametag-label');
  text.setAttribute('x', '80');
  text.setAttribute('y', '22');
  text.setAttribute('text-anchor', 'middle');
  text.textContent = formatNametagText(name, level);

  const pin = document.createElementNS(SVG_NS, 'polygon');
  pin.setAttribute('class', 'nametag-pin');
  pin.setAttribute('points', '80,34 72,40 88,40');

  svg.append(bg, text, pin);
  wrap.appendChild(svg);
  scene.nametagsLayer.appendChild(wrap);
  scene.remoteNametags.set(id, wrap);
  return wrap;
}

export function updateRemoteNametag(scene, id, name, level) {
  const el = scene.remoteNametags?.get(id);
  if (!el) return;
  const text = el.querySelector('.nametag-label');
  if (text) text.textContent = formatNametagText(name, level);
}

export function updateRemoteNametagPositions(scene) {
  if (!scene.remoteNametags?.size || !scene.remoteSprites?.size) return;

  const showNames = areNametagsVisible();

  for (const [id, spr] of scene.remoteSprites) {
    const tag = scene.remoteNametags.get(id);
    if (!tag || !spr?.active) continue;

    if (!showNames) {
      tag.style.display = 'none';
      continue;
    }

    const pos = worldToNametagPosition(scene, spr.x, spr.y - 22);
    if (!pos?.visible) {
      tag.style.display = 'none';
      continue;
    }

    tag.style.display = 'block';
    tag.style.left = `${pos.x}px`;
    tag.style.top = `${pos.y}px`;
  }
}

export function destroyRemoteNametag(scene, id) {
  const el = scene.remoteNametags?.get(id);
  el?.remove();
  scene.remoteNametags?.delete(id);
}

export function clearAllNametags(scene) {
  scene.remoteNametags?.forEach((el) => el.remove());
  scene.remoteNametags?.clear();
  scene.nametagsLayer?.replaceChildren();
}

function formatNametagText(name, level) {
  const nm = (name || 'Xogador').slice(0, 18);
  return `${nm} · Nv.${level ?? 1}`;
}

/** Mundo Phaser → px dentro de #game-container (independente do zoom da cámara). */
export function worldToNametagPosition(scene, worldX, worldY) {
  const cam = scene.cameras?.main;
  const canvas = scene.game?.canvas;
  const container = document.getElementById('game-container');
  if (!cam || !canvas || !container) return null;

  const camPoint = new Phaser.Math.Vector2();
  if (typeof cam.getScreenPoint === 'function') {
    cam.getScreenPoint(worldX, worldY, camPoint);
  } else {
    camPoint.x = (worldX - cam.worldView.x) * cam.zoom;
    camPoint.y = (worldY - cam.worldView.y) * cam.zoom;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const scaleX = canvasRect.width / cam.width;
  const scaleY = canvasRect.height / cam.height;

  const x = camPoint.x * scaleX + canvasRect.left - containerRect.left;
  const y = camPoint.y * scaleY + canvasRect.top - containerRect.top;

  const margin = 100;
  const visible =
    camPoint.x >= -margin &&
    camPoint.x <= cam.width + margin &&
    camPoint.y >= -margin &&
    camPoint.y <= cam.height + margin;

  return { x, y, visible };
}
