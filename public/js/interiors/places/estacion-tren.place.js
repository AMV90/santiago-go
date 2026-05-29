import { buildEstacionTrenLayout, ESTACION_CHATTER } from '../layouts/estacion-tren.layout.js';
import { drawEstacionTrenDoor } from '../door-art.js';
import { ESTACION_TREN } from '../../map-bounds.js';

export const estacionTrenPlace = {
  id: 'estacion-tren',
  label: 'Estación · Daniel Castelao',
  enterToast: 'Entraches na Estación de Santiago',
  exitToast: 'Saíches á Rúa do Hórreo (Daniel Castelao)',
  world: { kind: 'lonlat', lon: ESTACION_TREN.lon, lat: ESTACION_TREN.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildEstacionTrenLayout,
  door: {
    textureKey: 'door-estacion-tren',
    draw: drawEstacionTrenDoor,
    tooltip: 'Estación de Santiago',
    sceneKey: 'estacionTrenDoor',
  },
  actors: {
    chatter: {
      spriteRole: 'bot',
      defaultEmoji: '🚆',
      intervalMs: 8000,
      bubbleBg: '#e3f2fd',
      bubbleColor: '#1a237e',
      wordWrap: 165,
      patrons: ESTACION_CHATTER,
    },
  },
};
