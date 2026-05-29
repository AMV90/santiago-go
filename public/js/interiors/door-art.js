/** Texturas de portas compartidas (pixel art 14×18) */

export function drawCathedralDoor(g) {
  g.fillStyle(0x5c4a3a, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x3d2817, 1);
  g.fillRect(2, 4, 10, 13);
  g.fillStyle(0x1a1510, 1);
  g.fillCircle(7, 5, 4);
  g.fillStyle(0x6b4423, 1);
  g.fillRect(3, 7, 3, 9);
  g.fillRect(8, 7, 3, 9);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(7, 13, 1);
}

export function drawBarMomoDoor(g) {
  g.fillStyle(0x2c1810, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x4a2020, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0xff6b9d, 0.9);
  g.fillRect(3, 4, 8, 3);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(10, 11, 1);
  g.fillStyle(0x1a1510, 1);
  g.fillRect(4, 8, 6, 8);
}

export function drawRiquelaDoor(g) {
  g.fillStyle(0x1a1020, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x4a3050, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0x9b59b6, 0.95);
  g.fillRect(3, 4, 8, 3);
  g.fillStyle(0xf4d35e, 1);
  g.fillRect(5, 5, 4, 1);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(10, 11, 1);
  g.fillStyle(0x2c1810, 1);
  g.fillRect(4, 9, 6, 7);
}

export function drawModusVivendiDoor(g) {
  g.fillStyle(0x1e1812, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x3d3228, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0x5c4030, 1);
  g.fillRect(3, 5, 8, 10);
  g.fillStyle(0xc9a227, 0.9);
  g.fillRect(4, 4, 6, 2);
  g.fillStyle(0x8b6914, 1);
  g.fillCircle(10, 11, 1);
  g.fillStyle(0x2a2218, 1);
  g.fillRect(5, 7, 4, 6);
}

export function drawAreaCentralDoor(g) {
  g.fillStyle(0xeceff1, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x90a4ae, 1);
  g.fillRect(2, 2, 10, 15);
  g.fillStyle(0x546e7a, 1);
  g.fillRect(3, 4, 8, 10);
  g.fillStyle(0x4fc3f7, 0.55);
  g.fillRect(4, 5, 6, 7);
  g.fillStyle(0xf4d35e, 1);
  g.fillRect(3, 3, 8, 2);
  g.fillStyle(0x37474f, 1);
  g.fillRect(6, 12, 2, 4);
}

function drawSiteDoorBase(g, wall, panel, accent) {
  g.fillStyle(wall, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(panel, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(accent, 1);
  g.fillRect(3, 4, 8, 6);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(10, 11, 1);
}

export function drawSiteMarketDoor(g) {
  drawSiteDoorBase(g, 0x5d4037, 0x8d6e63, 0x81c784);
}

export function drawSiteMuseumDoor(g) {
  drawSiteDoorBase(g, 0x4e342e, 0x6d4c41, 0xd7ccc8);
}

export function drawSiteChurchDoor(g) {
  g.fillStyle(0x3d2817, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x5c4030, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0xc9a227, 0.9);
  g.fillRect(4, 4, 6, 8);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(10, 11, 1);
}

export function drawSiteLibraryDoor(g) {
  drawSiteDoorBase(g, 0x37474f, 0x546e7a, 0x90caf9);
}

export function drawSiteCivicDoor(g) {
  drawSiteDoorBase(g, 0x455a64, 0x78909c, 0xeceff1);
}

export function drawSiteParkDoor(g) {
  drawSiteDoorBase(g, 0x33691e, 0x558b2f, 0xaed581);
}

export function drawSiteMallDoor(g) {
  drawSiteDoorBase(g, 0x546e7a, 0x90a4ae, 0x4fc3f7);
}

export function drawSiteStadiumDoor(g) {
  drawSiteDoorBase(g, 0x1b5e20, 0x388e3c, 0xffffff);
}

export function drawPeleteiroDoor(g) {
  g.fillStyle(0x546e7a, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x37474f, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0x1e88e5, 0.6);
  g.fillRect(4, 5, 6, 8);
  g.fillStyle(0xffeb3b, 1);
  g.fillRect(3, 3, 8, 2);
  g.fillStyle(0xc62828, 1);
  g.fillRect(5, 12, 4, 2);
}

export function drawCorteInglesDoor(g) {
  g.fillStyle(0x1b5e20, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x2e7d32, 1);
  g.fillRect(1, 2, 12, 15);
  g.fillStyle(0xffffff, 1);
  g.fillRect(3, 4, 8, 5);
  g.fillStyle(0xc62828, 1);
  g.fillRect(4, 5, 6, 3);
  g.fillStyle(0x37474f, 1);
  g.fillRect(3, 11, 8, 5);
  g.fillStyle(0x81d4fa, 0.5);
  g.fillRect(4, 12, 6, 3);
  g.fillStyle(0xffd54f, 1);
  g.fillRect(5, 6, 4, 1);
}

export function drawEstacionTrenDoor(g) {
  g.fillStyle(0x546e7a, 1);
  g.fillRect(0, 0, 14, 18);
  g.fillStyle(0x37474f, 1);
  g.fillRect(2, 3, 10, 14);
  g.fillStyle(0x4fc3f7, 0.75);
  g.fillRect(3, 4, 8, 8);
  g.fillStyle(0xffd54f, 1);
  g.fillRect(4, 5, 6, 2);
  g.fillStyle(0x1e88e5, 1);
  g.fillRect(5, 8, 4, 1);
  g.fillStyle(0xc62828, 0.9);
  g.fillRect(3, 13, 8, 2);
  g.fillStyle(0xc9a227, 1);
  g.fillCircle(10, 11, 1);
}
