/** placeId → carpeta en assets/interiors/peleteiro/{built|source}/ */
export const PLACE_TO_FORGE_ZONE = {
  'peleteiro-patio': 'patio',
  'peleteiro-p1': 'floor-1',
  'peleteiro-p2': 'floor-2',
  'peleteiro-p3': 'floor-3',
};

/** Caracteres que se renderizan como props separados (y-sort, Sprite Forge). */
export const PELETEIRO_PROP_CHARS = {
  c: 'chair',
  d: 'desk',
  M: 'teacher-desk',
  b: 'bookshelf',
  e: 'display',
  p: 'blackboard',
  n: 'bench',
  o: 'computer',
  i: 'plant',
  m: 'palm-pot',
  t: 'palm-trunk',
  P: 'palm-leaf',
  C: 'casita',
  S: 'skeleton-prop',
  w: 'wisp',
  x: 'window',
  h: 'wall',
  Y: 'library-carpet',
  K: 'crypt-floor',
  G: 'crypt-fog',
};

export function isPeleteiroPropChar(ch) {
  return ch in PELETEIRO_PROP_CHARS;
}

export function forgeAssetPath(zoneKey, file) {
  return `assets/interiors/peleteiro/built/${zoneKey}/${file}`;
}

export function forgeSourcePath(zoneKey, file) {
  return `assets/interiors/peleteiro/source/${zoneKey}/${file}`;
}
