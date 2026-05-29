import { buildCasinaMisteriosaHouseLayout } from '../layouts/casiña-misteriosa-house.layout.js';
import { buildCasinaMisteriosaParqueLayout } from '../layouts/casiña-misteriosa-parque.layout.js';
import { CASINA_VIRXE_RIAL } from '../../map-bounds.js';
import { drawCasinaMisteriosaDoor } from '../door-art.js';
import { pickCharacterId } from '../../character-catalog.js';

export const casinaMisteriosaPlace = {
  id: 'casiña-misteriosa',
  label: 'Casiña misteriosa',
  enterToast: 'A casiña che recibe en silencio… oíches algo no pasillo?',
  exitToast: 'Saíches á Rúa da Virxe do Rial, 8',
  world: { kind: 'lonlat', lon: CASINA_VIRXE_RIAL.lon, lat: CASINA_VIRXE_RIAL.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildCasinaMisteriosaHouseLayout,
  links: { up: 'casiña-misteriosa-parque' },
  door: {
    textureKey: 'door-casiña-misteriosa',
    draw: drawCasinaMisteriosaDoor,
    tooltip: 'Casiña misteriosa · nº 8',
    sceneKey: 'casinaMisteriosaDoor',
  },
  actors: {
    chatter: {
      spriteRole: 'npc',
      intervalMs: 11000,
      bubbleBg: '#311b4a',
      bubbleColor: '#e1bee7',
      wordWrap: 170,
      patrons: [
        {
          id: 'casiña-sombra',
          tx: 16,
          ty: 8,
          archetype: 'chatter',
          characterId: pickCharacterId('chatter', 3),
          phrases: [
            'Non fixes demasiado ruído ao entrar… ben.',
            'A cocina está ao fondo do pasillo. Se che chega o olor, xa sabes.',
            'Alguén deixou as velas acesas na habitación do medio. Non fui eu.',
            'O parque está ao norte. As árbores murmurran cando chove.',
          ],
        },
      ],
    },
    ambient: {
      scenes: [
        {
          id: 'casiña-malinois-pasillo',
          kind: 'malinoisPatrol',
          textureKey: 'casina-malinois-1',
          tx0: 28,
          tx1: 42,
          ty: 17,
        },
      ],
    },
  },
};

export const casinaMisteriosaParquePlace = {
  id: 'casiña-misteriosa-parque',
  label: 'Parque da casiña',
  enterToast: 'O parque verde abraza a casiña. Só o vento entre as follas.',
  exitToast: null,
  world: { kind: 'lonlat', lon: CASINA_VIRXE_RIAL.lon, lat: CASINA_VIRXE_RIAL.lat },
  exit: null,
  layout: buildCasinaMisteriosaParqueLayout,
  links: { down: 'casiña-misteriosa' },
  door: null,
  actors: {
    chatter: {
      spriteRole: 'bot',
      showHeadIcon: false,
      intervalMs: 14000,
      bubbleBg: '#e8f5e9',
      bubbleColor: '#1b5e20',
      wordWrap: 160,
      patrons: [
        {
          id: 'casiña-parque-paseante',
          tx: 24,
          ty: 16,
          archetype: 'chatter',
          characterId: pickCharacterId('chatter', 5),
          phrases: [
            'Dicen que esta casa xa estaba aquí antes do Rial ter nome.',
            'As árbores do fondo teñen máis sombra ca outras. Non preguntes por qué.',
            'Volvo á casiña cando o sol baixa. A porta do sur coñócea a miña chave.',
          ],
        },
      ],
    },
    ambient: {
      scenes: [
        {
          id: 'casiña-malinois-parque',
          kind: 'malinoisPatrol',
          textureKey: 'casina-malinois-2',
          tx0: 12,
          tx1: 36,
          ty: 24,
          speed: 26,
        },
      ],
    },
  },
};

export const casinaMisteriosaPlaces = [casinaMisteriosaPlace, casinaMisteriosaParquePlace];
