/**
 * Escaleiras tipo Pokémon con inclinación suave (30° lixeira), sen manchas no chan.
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {number} x
 * @param {number} y
 * @param {number} ts
 * @param {{ cols: number, rows: number, direction: 'up'|'down' }} opts
 */
export function drawInteriorStairwell(gfx, x, y, ts, opts) {
  const { cols, rows, direction } = opts;
  const w = cols * ts;
  const h = rows * ts;
  const up = direction === 'up';

  const sideInset = Math.max(6, Math.floor(w * 0.12));
  const run = Math.max(3, Math.floor(ts * 0.24));
  const rise = Math.max(4, Math.floor(ts * 0.34));
  const stepCount = Math.max(6, rows * 2 + 2);

  const leftBase = x + sideInset;
  const rightBase = x + w - sideInset;
  const baseY = up ? y + h - 5 : y + 5;

  const TREAD = 0xf1eadf;
  const TREAD_HI = 0xffffff;
  const RISER = 0xa78f70;
  const RISER_DK = 0x7c664e;
  const SIDE = 0x8a775f;
  const LINE = 0x2c241c;

  const signY = up ? -1 : 1;
  const stepPos = (i) => ({
    l: leftBase + i * run,
    r: rightBase + i * run,
    y: baseY + i * rise * signY,
  });

  // Lateral esquerdo (dente de serra suave)
  gfx.fillStyle(SIDE, 1);
  gfx.beginPath();
  const p0 = stepPos(0);
  gfx.moveTo(p0.l, p0.y);
  for (let i = 0; i < stepCount; i++) {
    const a = stepPos(i);
    const b = stepPos(i + 1);
    gfx.lineTo(b.l, a.y);
    gfx.lineTo(b.l, b.y);
  }
  const pend = stepPos(stepCount);
  gfx.lineTo(pend.l, pend.y + (up ? rise : -rise));
  gfx.lineTo(p0.l, p0.y + (up ? rise : -rise));
  gfx.closePath();
  gfx.fillPath();

  for (let i = 0; i < stepCount; i++) {
    const a = stepPos(i);
    const b = stepPos(i + 1);
    const treadH = Math.max(4, Math.floor(ts * 0.3));
    const riserH = Math.max(3, Math.floor(ts * 0.22));
    const yTop = up ? a.y - treadH : a.y;

    // Tread
    gfx.fillStyle(TREAD, 1);
    gfx.fillRect(a.l, yTop, b.r - a.l, treadH);
    gfx.fillStyle(TREAD_HI, 0.45);
    gfx.fillRect(a.l + 1, yTop + 1, Math.max(1, b.r - a.l - 2), 1);
    gfx.lineStyle(1, LINE, 0.75);
    gfx.strokeRect(a.l, yTop, b.r - a.l, treadH);

    // Riser
    const yRiser = up ? yTop + treadH : yTop - riserH;
    gfx.fillStyle(i % 2 === 0 ? RISER : RISER_DK, 1);
    gfx.fillRect(a.l, yRiser, b.r - a.l, riserH);
    gfx.lineStyle(1, LINE, 0.65);
    gfx.strokeRect(a.l, yRiser, b.r - a.l, riserH);
  }

  // Tramo superior (meseta)
  const top = stepPos(stepCount);
  const platH = Math.max(6, Math.floor(ts * 0.42));
  gfx.fillStyle(RISER_DK, 1);
  gfx.fillRect(top.l - 1, up ? top.y - platH : top.y, 18, platH);
  gfx.lineStyle(1, LINE, 0.85);
  gfx.strokeRect(top.l - 1, up ? top.y - platH : top.y, 18, platH);

  // Flecha pequena
  const lx = x + w / 2;
  const ly = up ? y + 4 : y + h - 10;
  gfx.fillStyle(0x37474f, 0.82);
  gfx.fillRect(lx - 12, ly, 24, 8);
  gfx.fillStyle(0xffca28, 1);
  if (up) {
    gfx.fillTriangle(lx, ly + 1, lx - 3, ly + 6, lx + 3, ly + 6);
  } else {
    gfx.fillTriangle(lx, ly + 7, lx - 3, ly + 2, lx + 3, ly + 2);
  }
}
