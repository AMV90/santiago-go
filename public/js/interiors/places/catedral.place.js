import { buildCatedralLayout, CATHEDRAL_BATTLE_NPCS } from '../layouts/catedral.layout.js';
import { drawCathedralDoor } from '../door-art.js';
import { createClergyEnemy, drawPriestTexture } from '../interior-actors.js';

export const catedralPlace = {
  id: 'catedral',
  label: 'Catedral de Santiago',
  enterToast: 'Entraches na Catedral',
  exitToast: 'Saíches á Praza do Obradoiro',
  world: { kind: 'spawn' },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildCatedralLayout,
  door: {
    textureKey: 'door-catedral',
    draw: drawCathedralDoor,
    tooltip: 'Catedral de Santiago',
    sceneKey: 'cathedralDoor',
  },
  actors: {
    battle: {
      storageKey: 'santiago-go-priest-defeated',
      npcs: CATHEDRAL_BATTLE_NPCS,
      texture: { key: 'char-priest', draw: drawPriestTexture },
      createEnemy: createClergyEnemy,
      tag: () => '⛪ Nv30',
    },
  },
};
