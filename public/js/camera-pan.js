import { CAMERA_LERP } from './config.js';

/**
 * Arrastre con botón central do rato para desprazar a cámara.
 * Ao mover o personaxe de novo, volve a seguirlo.
 */

export function resetCameraPanState(scene) {
  scene._camPan = null;
  scene._cameraUserControl = false;
}

export function setupCameraPan(scene) {
  if (scene._cameraPanBound) return;
  scene._cameraPanBound = true;

  const canvas = scene.game?.canvas;
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) e.preventDefault();
    });
  }

  scene.input.on('pointerdown', (pointer) => {
    if (scene.inBattle || scene.interiorTransition) return;
    if (!pointer.middleButtonDown()) return;

    const cam = scene.cameras.main;
    scene._camPan = {
      x: pointer.x,
      y: pointer.y,
      scrollX: cam.scrollX,
      scrollY: cam.scrollY,
    };
    cam.stopFollow();
    scene._cameraUserControl = true;
  });

  scene.input.on('pointermove', (pointer) => {
    if (!scene._camPan || scene.inBattle) return;
    if (!pointer.middleButtonDown()) {
      scene._camPan = null;
      return;
    }

    const cam = scene.cameras.main;
    const dx = (pointer.x - scene._camPan.x) / cam.zoom;
    const dy = (pointer.y - scene._camPan.y) / cam.zoom;
    cam.setScroll(scene._camPan.scrollX - dx, scene._camPan.scrollY - dy);
  });

  scene.input.on('pointerup', (pointer) => {
    if (pointer.button === 1) scene._camPan = null;
  });
}

/** Volve a centrar a cámara no xogador tras desprazamento manual. */
export function resumeCameraFollow(scene) {
  const cam = scene.cameras.main;
  const p = scene.player;
  if (!cam || !p) return;
  cam.stopFollow();
  cam.startFollow(p, true, CAMERA_LERP, CAMERA_LERP);
}

export function notifyPlayerMoved(scene) {
  if (!scene._cameraUserControl) return;
  resetCameraPanState(scene);
  resumeCameraFollow(scene);
}
