import {
  buildModusVivendiLayout,
  MODUS_WAITRESS,
  MODUS_SINGER,
} from '../layouts/modus-vivendi.layout.js';
import { drawModusVivendiDoor } from '../door-art.js';
import { MODUS_VIVENDI } from '../../map-bounds.js';

const SINGER_LINES = [
  '♪ Nas caballerizas soa distinto… aquí abaixo non chove ♪',
  'Modus Vivendi dende os setenta — e seguimos sen pedir permiso!',
  'Un, dous, tres… e se fallo, dillo que foi estilo vintage.',
  'Grazas, Santiago! Volvede… que a caveira non se aluga barata.',
];

export const modusVivendiPlace = {
  id: 'modus-vivendi',
  label: 'Modus Vivendi',
  enterToast: 'Entraches no Modus Vivendi',
  exitToast: 'Saíches á Praza de Feixóo',
  world: { kind: 'lonlat', lon: MODUS_VIVENDI.lon, lat: MODUS_VIVENDI.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildModusVivendiLayout,
  door: {
    textureKey: 'door-modus-vivendi',
    draw: drawModusVivendiDoor,
    tooltip: 'Modus Vivendi',
    sceneKey: 'modusVivendiDoor',
  },
  actors: {
    chatter: {
      spriteRole: 'npc',
      patrons: [
        {
          id: 'modus-waitress',
          tx: MODUS_WAITRESS.tx,
          ty: MODUS_WAITRESS.ty,
          tint: 0xffb6c1,
          emoji: '🍺',
          phrases: [
            'Caña a 2,5 — Estrella Galicia, que non traizoa.',
            'Estrella ben fría, dous con cincuenta e un sorriso de retranca.',
            'Caña ou doble? Estrella, por suposto. Auga, no bar de en fronte.',
            'De quen ves sendo? Con ese pedido, de quen sabe o que quere.',
            'Se pides sen alcohol, tamén te servimos. Non fas chistes, vale.',
          ],
        },
        {
          id: 'modus-singer',
          tx: MODUS_SINGER.tx,
          ty: MODUS_SINGER.ty,
          tint: 0xd4a574,
          emoji: '🎤',
          phrases: SINGER_LINES,
        },
      ],
      intervalMs: 6500,
      bubbleBg: '#e8dcc8',
      bubbleColor: '#2a2018',
      wordWrap: 150,
    },
  },
};
