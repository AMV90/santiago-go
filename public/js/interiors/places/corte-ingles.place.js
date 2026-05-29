import { buildCorteInglesFloorLayout, CORTE_INGLES_FLOOR_INFO } from '../layouts/corte-ingles-floor.layout.js';
import { getCorteInglesPatrons } from '../corte-ingles-npcs.js';
import { CORTE_INGLES } from '../../map-bounds.js';
import { drawCorteInglesDoor } from '../door-art.js';

function floorPlace(floor) {
  const meta = CORTE_INGLES_FLOOR_INFO[floor];
  const links = {
    1: { up: 'corte-ingles-p2' },
    2: { up: 'corte-ingles-p3', down: 'corte-ingles-p1' },
    3: { up: 'corte-ingles-p4', down: 'corte-ingles-p2' },
    4: { down: 'corte-ingles-p3' },
  };

  return {
    id: `corte-ingles-p${floor}`,
    label: meta.label,
    enterToast: `${meta.label} — ${meta.subtitle}`,
    exitToast:
      floor === 1 ? 'Saíches ao Restollal' : `Baixaches á planta ${floor - 1}`,
    world: { kind: 'lonlat', lon: CORTE_INGLES.lon, lat: CORTE_INGLES.lat },
    exit: floor === 1 ? { kind: 'south', margin: 2.5 } : null,
    layout: () => buildCorteInglesFloorLayout(floor),
    links: links[floor],
    door:
      floor === 1
        ? {
            textureKey: 'door-corte-ingles',
            draw: drawCorteInglesDoor,
            tooltip: 'El Corte Inglés · Restollal',
            sceneKey: 'corteInglesDoor',
          }
        : null,
    actors: {
      chatter: {
        spriteRole: 'bot',
        showHeadIcon: false,
        intervalMs: 8500,
        bubbleBg: '#fff8e1',
        bubbleColor: '#4e342e',
        wordWrap: 165,
        patrons: getCorteInglesPatrons(floor),
      },
    },
  };
}

export const corteInglesPlaces = [
  floorPlace(1),
  floorPlace(2),
  floorPlace(3),
  floorPlace(4),
];
