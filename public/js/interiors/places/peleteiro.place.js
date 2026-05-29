import { buildPeleteiroPatioLayout } from '../layouts/peleteiro-patio.layout.js';
import { buildPeleteiroFloorLayout } from '../layouts/peleteiro-floor.layout.js';
import { getPeleteiroFloorNpcs } from '../peleteiro-npcs.js';
import { PELETEIRO_ANTIGUO } from '../../map-bounds.js';
import { drawPeleteiroDoor } from '../door-art.js';
import { pickCharacterId } from '../../character-catalog.js';
import { createBattleEnemy, formatLevelBattleTag } from '../../battle-enemies.js';

function battleActors(floor) {
  return {
    battle: {
      storageKey: 'santiago-go-peleteiro-defeated',
      npcs: getPeleteiroFloorNpcs(floor).map((n) => ({
        ...n,
        title: `${n.name} · nv. ${n.level}`,
      })),
      spriteRole: 'npc',
      createEnemy: createBattleEnemy,
      tag: formatLevelBattleTag,
    },
  };
}

function floorPlace(floor) {
  const labels = ['', '1º andar · biblioteca e aulas', '2º andar · aulas', '3º andar · cripta'];
  const links = {
    1: { up: 'peleteiro-p2', down: 'peleteiro-patio' },
    2: { up: 'peleteiro-p3', down: 'peleteiro-p1' },
    3: { down: 'peleteiro-p2' },
  };

  return {
    id: `peleteiro-p${floor}`,
    label: `Peleteiro · ${labels[floor]}`,
    enterToast: `Entraches no ${labels[floor]} do antigo Peleteiro (Minerva)`,
    exitToast: floor === 1 ? 'Baixaches ao patio' : `Baixaches ao ${labels[floor - 1] || 'piso anterior'}`,
    world: { kind: 'lonlat', lon: PELETEIRO_ANTIGUO.lon, lat: PELETEIRO_ANTIGUO.lat },
    exit: null,
    layout: () => buildPeleteiroFloorLayout(floor),
    links: links[floor],
    door: null,
    actors: battleActors(floor),
  };
}

export const peleteiroPatioPlace = {
  id: 'peleteiro-patio',
  label: 'Peleteiro · Patio',
  enterToast: 'Patio do Peleteiro — sube pola escaleira norte para entrar',
  exitToast: 'Saíches á Rúa da República Arxentina',
  world: { kind: 'lonlat', lon: PELETEIRO_ANTIGUO.lon, lat: PELETEIRO_ANTIGUO.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildPeleteiroPatioLayout,
  links: { up: 'peleteiro-p1' },
  door: {
    textureKey: 'door-peleteiro',
    draw: drawPeleteiroDoor,
    tooltip: 'Antigo Colexio Peleteiro',
    sceneKey: 'peleteiroDoor',
  },
  actors: {
    ambient: {
      scenes: [{ id: 'patio-nenos-balon', kind: 'kidsPlayingBall', tx: 17, ty: 26 }],
    },
    chatter: {
      spriteRole: 'bot',
      showHeadIcon: false,
      intervalMs: 9000,
      bubbleBg: '#e8eaf6',
      bubbleColor: '#1a237e',
      wordWrap: 160,
      patrons: [
        {
          id: 'peleteiro-recuerdo-1',
          tx: 15,
          ty: 34,
          archetype: 'chatter',
          characterId: pickCharacterId('chatter', 0),
          phrases: [
            'Aquí non había árbores: asfalto, eco e a palmeira da maceta.',
            'Cruzabas todo o patio para entrar… e volvías a cruzalo ao saír.',
            'De quen ves sendo? De quen aínda lembra o Minerva.',
          ],
        },
        {
          id: 'peleteiro-recuerdo-2',
          tx: 14,
          ty: 36,
          archetype: 'chatter',
          characterId: pickCharacterId('chatter', 1),
          phrases: [
            'A casiña vermella da portería, encima da palmeira… quen a lembra?',
            'A palmeira da maceta, á dereita ao entrar, xa era enorme.',
            'Ojalá haber estudiau máis e pelexado menos no recreo.',
            'Ermos máis de grelos con cachelo ou de selectividade? Ambos duelen.',
          ],
        },
      ],
    },
  },
};

export const peleteiroPlaces = [
  peleteiroPatioPlace,
  floorPlace(1),
  floorPlace(2),
  floorPlace(3),
];
