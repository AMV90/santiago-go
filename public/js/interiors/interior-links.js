import { getLastMoveDelta } from '../movement-controller.js';
import { switchLinkedInterior } from '../interior-zone.js';

const STAIR_COOLDOWN_MS = 600;
const MOVE_EPS = 0.35;

function tilesUnderPlayer(scene) {
  const cfg = scene.interiorConfig;
  const ts = cfg.tileSize;
  const px = scene.player.x;
  const py = scene.player.y;
  const coords = [
    { tx: Math.floor(px / ts), ty: Math.floor(py / ts) },
    { tx: Math.floor(px / ts), ty: Math.floor((py + 10) / ts) },
  ];
  const seen = new Set();
  const out = [];
  for (const { tx, ty } of coords) {
    const k = `${tx},${ty}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ tx, ty, char: cfg.getTileAt(tx, ty) });
  }
  return out;
}

function findLinkChar(scene, links) {
  if (!links) return null;
  const want = [];
  if (links.up) want.push('u');
  if (links.down) want.push('v');

  for (const { char } of tilesUnderPlayer(scene)) {
    if (want.includes(char)) return char;
  }
  return null;
}

export function findLinkCharForScene(scene) {
  return findLinkChar(scene, scene.interiorConfig?.links);
}

function wantsMoveUp(scene) {
  if (scene.cursors?.up?.isDown || scene.wasd?.W?.isDown) return true;
  const { dy } = getLastMoveDelta(scene);
  if (dy < -MOVE_EPS) return true;
  const mv = scene.moveState;
  if (mv && mv.dirY < -0.15) return true;
  return false;
}

function wantsMoveDown(scene) {
  if (scene.cursors?.down?.isDown || scene.wasd?.S?.isDown) return true;
  const { dy } = getLastMoveDelta(scene);
  if (dy > MOVE_EPS) return true;
  const mv = scene.moveState;
  if (mv && mv.dirY > 0.15) return true;
  return false;
}

/** Escaleiras u/v: camiña na dirección (↑ subir, ↓ baixar). Sen E. */
export function checkInteriorLinks(scene, links, showToast) {
  if (!links || scene.inBattle || scene.interiorTransition) return;

  if (scene._linkCooldownUntil && performance.now() < scene._linkCooldownUntil) return;

  const linkChar = findLinkChar(scene, links);
  if (!linkChar) {
    scene._linkTilePrev = '';
    return;
  }

  if (linkChar === 'u' && links.up && wantsMoveUp(scene)) {
    switchLinkedInterior(scene, links.up, showToast, { via: 'up' });
    scene._linkTilePrev = 'u';
    scene._linkCooldownUntil = performance.now() + STAIR_COOLDOWN_MS;
    return;
  }

  if (linkChar === 'v' && links.down && wantsMoveDown(scene)) {
    switchLinkedInterior(scene, links.down, showToast, { via: 'down' });
    scene._linkTilePrev = 'v';
    scene._linkCooldownUntil = performance.now() + STAIR_COOLDOWN_MS;
    return;
  }

  scene._linkTilePrev = linkChar;
}
