/** Simple: solo rúas (sin tiles), estilo parecido ao panel de deseño. */
const NAMED_COLOR = 0xf4d35e;
const UNNAMED_COLOR = 0x7a8a9a;

// Estilo “deseño”: non engordar para non tapar detalles.
const NAMED_WIDTH = 4;
const UNNAMED_WIDTH = 2;
const NAMED_ALPHA = 0.85;
const UNNAMED_ALPHA = 0.65;

export function drawStreetLayer(gfx, streets) {
  gfx.clear();

  const named = streets.filter((s) => s.name && s.points.length >= 2);
  const unnamed = streets.filter((s) => (!s.name || !s.name.trim()) && s.points.length >= 2);

  gfx.lineStyle(NAMED_WIDTH, NAMED_COLOR, NAMED_ALPHA);
  for (let i = 0; i < named.length; i++) strokePath(gfx, named[i].points);

  gfx.lineStyle(UNNAMED_WIDTH, UNNAMED_COLOR, UNNAMED_ALPHA);
  for (let i = 0; i < unnamed.length; i++) strokePath(gfx, unnamed[i].points);
}

function strokePath(gfx, points) {
  gfx.beginPath();
  gfx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    gfx.lineTo(points[i].x, points[i].y);
  }
  gfx.strokePath();
}
