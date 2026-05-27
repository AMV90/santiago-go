import { buildBarMomoLayout, BAR_MOMO_CHATTER } from '../layouts/bar-momo.layout.js';
import { drawBarMomoDoor } from '../door-art.js';
import { BAR_MOMO } from '../../map-bounds.js';

export const barMomoPlace = {
  id: 'bar-momo',
  label: 'Pub Momo',
  enterToast: 'Entraches ao Pub Momo',
  exitToast: 'Saíches á Rúa da Virxe da Cerca',
  world: { kind: 'lonlat', lon: BAR_MOMO.lon, lat: BAR_MOMO.lat },
  exit: { kind: 'west', margin: 2.5 },
  layout: buildBarMomoLayout,
  door: {
    textureKey: 'door-bar-momo',
    draw: drawBarMomoDoor,
    tooltip: 'Pub Momo',
    sceneKey: 'barMomoDoor',
  },
  actors: {
    chatter: {
      patrons: BAR_MOMO_CHATTER,
      defaultEmoji: '🍺',
      intervalMs: 9000,
      bubbleBg: '#ffeaa7',
      bubbleColor: '#2d3436',
    },
  },
};
