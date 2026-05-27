/** Vista da cámara en coordenadas do mundo (para cargar mapa ao redor do que se ve). */
export function getCameraWorldView(scene) {
  const cam = scene.cameras.main;
  const halfW = cam.width / (2 * cam.zoom);
  const halfH = cam.height / (2 * cam.zoom);
  const cx = cam.scrollX + halfW;
  const cy = cam.scrollY + halfH;
  const radius = Math.hypot(halfW, halfH) + 480;
  return { cx, cy, halfW, halfH, radius };
}
