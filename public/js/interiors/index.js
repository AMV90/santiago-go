/**
 * Punto de entrada do sistema de instancias interiores.
 *
 * Para engadir un lugar novo:
 * 1. Crea interiors/layouts/mi-lugar.layout.js (planta ASCII + createLayout)
 * 2. Crea interiors/places/mi-lugar.place.js (metadata, porta, actores)
 * 3. Engádeo a ALL_PLACES en places/index.js
 * 4. (Opcional) door-art.js se a porta é personalizada
 */
import { compilePlace } from './compile-place.js';
import { ALL_PLACES } from './places/index.js';

const REGISTRY = Object.freeze(
  Object.fromEntries(ALL_PLACES.map((place) => [place.id, compilePlace(place)]))
);

export function getInteriorConfig(zoneId) {
  return REGISTRY[zoneId] ?? null;
}

export function getPlaceDefinitions() {
  return ALL_PLACES;
}

export function getCompiledPlaces() {
  return REGISTRY;
}

export const CATHEDRAL_ZONE_ID = 'catedral';
export const BAR_MOMO_ZONE_ID = 'bar-momo';
export const RIQUELA_ZONE_ID = 'riquela';
export const MODUS_VIVENDI_ZONE_ID = 'modus-vivendi';
export const AREA_CENTRAL_ZONE_ID = 'area-central';
export const ESTACION_TREN_ZONE_ID = 'estacion-tren';
export const CORTE_INGLES_ZONE_ID = 'corte-ingles-p1';

export { initAllPlaceDoors, setPlaceDoorsVisible } from './place-doors.js';
