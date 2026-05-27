/**
 * Tiles OSM — cubren toda a vista da cámara (non só un cadrado pequeno).
 */
import { getCameraWorldView } from './viewport-utils.js';

export function createTileManager(scene) {
  const projection = scene.projection;
  const active = new Map();
  let lastKey = '';

  function addTile(tx, ty) {
    const key = `${tx},${ty}`;
    if (active.has(key)) return;

    const loaderKey = `tile-${tx}-${ty}`;
    const url = projection.tileUrl(tx, ty);

    const onReady = () => {
      if (!scene.textures.exists(loaderKey) || active.has(key)) return;
      const rect = projection.tileToGameRect(tx, ty);
      const img = scene.add.image(rect.x + rect.width / 2, rect.y + rect.height / 2, loaderKey);
      img.setDisplaySize(rect.width, rect.height);
      img.setAlpha(0.92);
      img.setDepth(1);
      active.set(key, img);
    };

    if (scene.textures.exists(loaderKey)) {
      onReady();
      return;
    }

    scene.load.image({ key: loaderKey, url, crossOrigin: 'anonymous' });
    scene.load.once(`filecomplete-image-${loaderKey}`, onReady);
    if (!scene.load.isLoading()) scene.load.start();
  }

  function update() {
    const { cx, cy, halfW, halfH } = getCameraWorldView(scene);
    const { tx: tx0, ty: ty0 } = projection.gameToTile(cx - halfW, cy - halfH);
    const { tx: tx1, ty: ty1 } = projection.gameToTile(cx + halfW, cy + halfH);

    const key = `${tx0},${ty0},${tx1},${ty1},${scene.cameras.main.zoom.toFixed(2)}`;
    if (key === lastKey) return;
    lastKey = key;

    const needed = new Set();
    for (let x = tx0 - 1; x <= tx1 + 1; x++) {
      for (let y = ty0 - 1; y <= ty1 + 1; y++) {
        needed.add(`${x},${y}`);
        addTile(x, y);
      }
    }

    for (const [k, img] of active) {
      if (!needed.has(k)) {
        img.destroy();
        active.delete(k);
      }
    }
  }

  function setVisible(visible) {
    for (const img of active.values()) {
      img.setVisible(visible);
    }
  }

  return { update, setVisible };
}
