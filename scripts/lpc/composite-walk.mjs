/**
 * Compón capas walk.png LPC (576×256) nun único spritesheet.
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const WALK_W = 576;
const WALK_H = 256;

function blit(dst, src) {
  for (let y = 0; y < WALK_H; y++) {
    for (let x = 0; x < WALK_W; x++) {
      const si = (WALK_W * y + x) << 2;
      const a = src.data[si + 3];
      if (a < 8) continue;
      const di = (WALK_W * y + x) << 2;
      const alpha = a / 255;
      if (alpha >= 0.98) {
        dst.data[di] = src.data[si];
        dst.data[di + 1] = src.data[si + 1];
        dst.data[di + 2] = src.data[si + 2];
        dst.data[di + 3] = src.data[si + 3];
      } else {
        dst.data[di] = Math.round(src.data[si] * alpha + dst.data[di] * (1 - alpha));
        dst.data[di + 1] = Math.round(src.data[si + 1] * alpha + dst.data[di + 1] * (1 - alpha));
        dst.data[di + 2] = Math.round(src.data[si + 2] * alpha + dst.data[di + 2] * (1 - alpha));
        dst.data[di + 3] = Math.min(255, dst.data[di + 3] + a);
      }
    }
  }
}

/**
 * @param {string[]} layerPaths rutas absolutas aos walk.png
 * @returns {PNG}
 */
export function compositeWalkLayers(layerPaths) {
  const out = new PNG({ width: WALK_W, height: WALK_H });
  for (const p of layerPaths) {
    if (!fs.existsSync(p)) {
      console.warn(`  ⚠ capa ausente: ${p}`);
      continue;
    }
    const layer = PNG.sync.read(fs.readFileSync(p));
    if (layer.width !== WALK_W || layer.height !== WALK_H) {
      console.warn(`  ⚠ tamaño incorrecto ${layer.width}×${layer.height}: ${p}`);
      continue;
    }
    blit(out, layer);
  }
  return out;
}

export function writePng(png, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, PNG.sync.write(png));
}
