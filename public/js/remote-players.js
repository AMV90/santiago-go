import { applyCharacterSprite, updateWalkAnim } from './sprites.js';
import {
  ensureNametagsLayer,
  createRemoteNametag,
  updateRemoteNametag,
  updateRemoteNametagPositions,
  destroyRemoteNametag,
} from './player-nametags.js';

export function createRemoteLayer(scene) {
  scene.remoteSprites = new Map();
  ensureNametagsLayer(scene);
}

export function syncRemotePlayers(scene, players, localId) {
  const ids = new Set();

  for (const p of players) {
    if (!p?.id || p.id === localId) continue;
    ids.add(p.id);

    let spr = scene.remoteSprites.get(p.id);
    if (!spr) {
      spr = scene.add.sprite(p.x, p.y, 'char-remote');
      applyCharacterSprite(spr, 'remote', scene, hashVariant(p.id));
      spr.setDepth(24);
      spr.setVisible(true);
      spr.setScale(1.35);
      spr.setTint(0xe040fb);
      spr.setData('isRemotePlayer', true);

      const ring = scene.add.circle(p.x, p.y + 10, 10, 0xe040fb, 0.35);
      ring.setDepth(23);
      ring.setStrokeStyle(2, 0xffffff, 0.9);
      spr.setData('remoteRing', ring);

      createRemoteNametag(scene, p.id, p.name, p.level);
      scene.remoteSprites.set(p.id, spr);
    }

    const prevX = spr.x;
    const prevY = spr.y;
    spr.x += (p.x - spr.x) * 0.4;
    spr.y += (p.y - spr.y) * 0.4;
    updateWalkAnim(spr, spr.x - prevX, spr.y - prevY, scene, 'remote');

    updateRemoteNametag(scene, p.id, p.name, p.level);

    const ring = spr.getData('remoteRing');
    if (ring?.active) ring.setPosition(spr.x, spr.y + 10);
  }

  for (const [id, spr] of scene.remoteSprites) {
    if (!ids.has(id)) {
      spr.getData('remoteRing')?.destroy();
      spr.destroy();
      destroyRemoteNametag(scene, id);
      scene.remoteSprites.delete(id);
    }
  }

  updateRemoteNametagPositions(scene);
}

export function removeRemotePlayer(scene, id) {
  const spr = scene.remoteSprites.get(id);
  spr?.getData('remoteRing')?.destroy();
  spr?.destroy();
  destroyRemoteNametag(scene, id);
  scene.remoteSprites.delete(id);
  scene.chatBubbles?.get(id)?.text?.destroy();
  scene.chatBubbles?.delete(id);
}

export { updateRemoteNametagPositions };

function hashVariant(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 1000;
  return h;
}
