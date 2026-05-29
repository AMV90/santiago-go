import { CAMERA_LERP } from './config.js';
import { isInInterior } from './interior-zone.js';
import { isBattleOpen } from './battle-ui.js';

/**
 * Cámara manual: botón central (desktop) + pinch/drag (móbil).
 * Ao mover o personaxe (WASD, ruta, interior), volve a seguirlo.
 */

export const CAMERA_ZOOM_MIN = 0.7;
export const CAMERA_ZOOM_MAX = 2.1;
const TAP_SLOP_PX = 14;
const PINCH_MIN_DIST = 20;

export function clampCameraZoom(z) {
  return Phaser.Math.Clamp(z, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
}

export function resetCameraPanState(scene) {
  scene._camPan = null;
  scene._pinch = null;
  scene._cameraUserControl = false;
  scene._touchCameraGesture = false;
}

function cameraBlocked(scene) {
  return scene.inBattle || isBattleOpen() || scene.interiorTransition || isInInterior(scene);
}

function activePointers(scene) {
  const out = [];
  if (scene.input.pointer1?.isDown) out.push(scene.input.pointer1);
  if (scene.input.pointer2?.isDown) out.push(scene.input.pointer2);
  return out;
}

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Zoom mantendo fixo un punto de pantalla (centro do pinch). */
export function zoomCameraAt(cam, zoom, screenX, screenY) {
  const before = cam.getWorldPoint(screenX, screenY);
  cam.setZoom(clampCameraZoom(zoom));
  const after = cam.getWorldPoint(screenX, screenY);
  cam.scrollX += before.x - after.x;
  cam.scrollY += before.y - after.y;
}

function beginUserCameraControl(scene) {
  scene._cameraUserControl = true;
  scene._mapTapPending = null;
  scene.cameras.main.stopFollow();
}

function startPan(scene, pointer) {
  const cam = scene.cameras.main;
  scene._camPan = {
    id: pointer.id,
    x: pointer.x,
    y: pointer.y,
    scrollX: cam.scrollX,
    scrollY: cam.scrollY,
  };
  beginUserCameraControl(scene);
}

function updatePan(scene, pointer) {
  if (!scene._camPan || scene._camPan.id !== pointer.id) return;
  const cam = scene.cameras.main;
  const dx = (pointer.x - scene._camPan.x) / cam.zoom;
  const dy = (pointer.y - scene._camPan.y) / cam.zoom;
  if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) scene._touchCameraGesture = true;
  cam.setScroll(scene._camPan.scrollX - dx, scene._camPan.scrollY - dy);
}

function startPinch(scene, p1, p2) {
  const cam = scene.cameras.main;
  const dist = pointerDistance(p1, p2);
  if (dist < PINCH_MIN_DIST) return;
  scene._pinch = {
    startDist: dist,
    startZoom: cam.zoom,
    midX: (p1.x + p2.x) / 2,
    midY: (p1.y + p2.y) / 2,
  };
  scene._camPan = null;
  beginUserCameraControl(scene);
  scene._touchCameraGesture = true;
}

function updatePinch(scene, p1, p2) {
  if (!scene._pinch) return;
  const dist = pointerDistance(p1, p2);
  if (dist < PINCH_MIN_DIST) return;
  const ratio = dist / scene._pinch.startDist;
  zoomCameraAt(scene.cameras.main, scene._pinch.startZoom * ratio, scene._pinch.midX, scene._pinch.midY);
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
    if (cameraBlocked(scene)) return;

    if (pointer.middleButtonDown()) {
      startPan(scene, pointer);
      return;
    }

    const pts = activePointers(scene);
    if (pts.length >= 2) {
      startPinch(scene, pts[0], pts[1]);
    } else if (scene._cameraUserControl && pointer.isDown) {
      startPan(scene, pointer);
    }
  });

  scene.input.on('pointermove', (pointer) => {
    if (cameraBlocked(scene)) return;

    const pts = activePointers(scene);
    if (pts.length >= 2) {
      if (!scene._pinch) startPinch(scene, pts[0], pts[1]);
      else updatePinch(scene, pts[0], pts[1]);
      return;
    }

    if (scene._camPan) {
      if (pointer.middleButtonDown() || pointer.id === scene._camPan.id) {
        updatePan(scene, pointer);
      } else if (!pointer.middleButtonDown()) {
        scene._camPan = null;
      }
    }
  });

  scene.input.on('pointerup', (pointer) => {
    if (pointer.button === 1 || (scene._camPan && pointer.id === scene._camPan.id)) {
      scene._camPan = null;
    }

    const pts = activePointers(scene);
    if (pts.length < 2) scene._pinch = null;
    if (!pts.length) scene._touchCameraGesture = false;
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

export function isMapTapSlop(_scene, pointer, startX, startY) {
  return Math.hypot(pointer.x - startX, pointer.y - startY) <= TAP_SLOP_PX;
}
