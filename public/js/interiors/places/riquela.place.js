import { buildRiquelaLayout, RIQUELA_SINGER } from '../layouts/riquela.layout.js';
import { drawRiquelaDoor } from '../door-art.js';
import { RIQUELA } from '../../map-bounds.js';

const SINGER_LINES = [
  '♪ La la la… outro tema máis! ♪',
  'Grazas, Santiago! Volvede mañá.',
  'Isto é ao vivo no Riquela Club!',
  'Un, dous, tres… e aínda queda máis!',
  'Para os que viñestes desde o bar… grazas!',
];

export const riquelaPlace = {
  id: 'riquela',
  label: 'Riquela Club',
  enterToast: 'Entraches no Riquela Club',
  exitToast: 'Saíches á Rúa do Preguntoiro',
  world: { kind: 'lonlat', lon: RIQUELA.lon, lat: RIQUELA.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildRiquelaLayout,
  door: {
    textureKey: 'door-riquela',
    draw: drawRiquelaDoor,
    tooltip: 'Riquela Club',
    sceneKey: 'riquelaDoor',
  },
  actors: {
    chatter: {
      spriteRole: 'npc',
      patrons: [
        {
          id: 'riquela-singer',
          tx: RIQUELA_SINGER.tx,
          ty: RIQUELA_SINGER.ty,
          tint: RIQUELA_SINGER.tint,
          emoji: '🎤',
          phrases: SINGER_LINES,
        },
      ],
      intervalMs: 5500,
      bubbleBg: '#e8d4ff',
      bubbleColor: '#2d1f3d',
      wordWrap: 160,
    },
  },
};
