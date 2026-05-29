import { pickCharacterId, spawnCharacterSalt } from '../character-catalog.js';

const MENDIGO_PHRASES = [
  {
    name: 'Mendigo do recreo',
    presentationLine: 'Un mendigo do antigo recreo estende a man… e o puño.',
    battleQuote: 'Só quería un euro para o libro de mates… dame ou pechamos.',
  },
  {
    name: 'Vendedor de chorizos',
    presentationLine: 'Cheira a comedor e a desesperación.',
    battleQuote: 'Na fariña non hai futuro, na loita quizais si.',
  },
];

const ESTUDANTE_PHRASES = [
  {
    name: 'Estudante sen selectividade',
    presentationLine: 'Un alumno perdido mira o teu expediente inexistente.',
    battleQuote: 'Por que non seguín os estudos? Agora non hai Ctrl+Z.',
  },
  {
    name: 'Promoción do 84',
    presentationLine: 'A promoción do 84 volve pedir explicacións.',
    battleQuote: 'Ojalá haber estudiau… pero había terraza e noites.',
  },
  {
    name: 'Suspenso eterno',
    presentationLine: 'O suspenso eterno levanta a cabeza da carteira.',
    battleQuote: 'Ao final metinme na fariña, meu. O profe non entende.',
  },
  {
    name: 'Alumno da biblioteca',
    presentationLine: 'Achegaselle á mesa de estudo e esixe un duelo.',
    battleQuote: 'Estudiei pouco e soñei moito. Agora soño con gañar.',
  },
];

const ESPECTRO_PHRASES = [
  {
    name: 'Espectro do 2º',
    presentationLine: 'Un espectro flota no pasillo…',
    battleQuote: 'Debín seguir en ciencias… agora peno en B.',
  },
  {
    name: 'Espectro do internado',
    presentationLine: 'O eco do internado pide contas.',
    battleQuote: 'De quen ves sendo? De quen deixou a carreira a medias.',
  },
  {
    name: 'Espectro da selectividade',
    presentationLine: 'A selectividade nunca rematou para esta alma.',
    battleQuote: 'Ermos máis de grelos con cachelo ou de exame de setembro?',
  },
  {
    name: 'Espectro do profesor',
    presentationLine: 'Un profesor espectral alza o puntero laser espectral.',
    battleQuote: 'Corrixo exames aínda coa aula ardendo. Aprobaches? Non.',
  },
];

const ESQUELETO_PHRASES = [
  {
    name: 'Esqueleto de portería',
    presentationLine: 'Os ósos da portería crugiren ao verte.',
    battleQuote: 'A casiña vermella está baleira… pero eu non.',
  },
  {
    name: 'Esqueleto de biblioteca',
    presentationLine: 'Un esqueleto cae dunha estantería.',
    battleQuote: 'Devolveme o Carné Jove… ou o teu.',
  },
  {
    name: 'Esqueleto de química',
    presentationLine: 'O laboratorio deixou só huesos e reactivos.',
    battleQuote: 'H2O? Non. H2Ow!',
  },
];

const PROFESOR_PHRASES = [
  {
    name: 'Profesor de química',
    presentationLine: 'O laboratorio arde e o profesor tamén.',
    battleQuote: 'A reacción espertou… e non é exotérmica, é persoal.',
  },
];

function pick(arr, i) {
  return arr[i % arr.length];
}

export function getPeleteiroFloorNpcs(floor) {
  const base = 8 + floor * 5;
  const list = [];

  const add = (def, tx, ty, archetype, levelOff = 0, profile = 'school') => {
    const idx = list.length;
    const salt = spawnCharacterSalt({
      placeId: 'peleteiro',
      floor,
      index: idx,
      levelOff,
      tx,
      ty,
    });
    list.push({
      id: `peleteiro-f${floor}-${idx}`,
      tx,
      ty,
      level: base + levelOff,
      archetype,
      battleProfile: profile,
      faction: 'peleteiro',
      characterId: def.characterId ?? pickCharacterId(archetype, salt),
      ...def,
    });
  };

  if (floor === 1) {
    add(pick(ESTUDANTE_PHRASES, 3), 18, 14, 'student', 1);
    add(
      {
        name: 'Bibliotecaria fantasma',
        presentationLine: 'A bibliotecaria do Minerva aínda ordena silencios.',
        battleQuote: 'Silencio na sala… ou pelexa.',
        characterId: pickCharacterId('specter', 7),
      },
      20,
      12,
      'specter',
      4
    );
    add(pick(ESTUDANTE_PHRASES, 0), 56, 15, 'student', 2);
    add(pick(ESTUDANTE_PHRASES, 1), 56, 36, 'student', 3);
    add(pick(ESTUDANTE_PHRASES, 2), 18, 36, 'student', 1);
    add(pick(MENDIGO_PHRASES, 0), 38, 26, 'beggar', 0);
    add(pick(MENDIGO_PHRASES, 1), 42, 27, 'beggar', 1);
  }

  if (floor === 2) {
    add(pick(ESTUDANTE_PHRASES, 1), 18, 9, 'student', 0);
    add(pick(ESTUDANTE_PHRASES, 3), 36, 9, 'student', 1);
    add(pick(ESTUDANTE_PHRASES, 0), 54, 9, 'student', 2);
    add(pick(ESPECTRO_PHRASES, 0), 38, 26, 'specter', 4);
    add(pick(PROFESOR_PHRASES, 0), 24, 26, 'professor', 5);
    add(pick(ESTUDANTE_PHRASES, 2), 18, 43, 'student', 3);
    add(pick(MENDIGO_PHRASES, 0), 54, 43, 'beggar', 2);
    add(pick(ESPECTRO_PHRASES, 2), 60, 26, 'specter', 3);
  }

  if (floor === 3) {
    add(pick(ESQUELETO_PHRASES, 0), 38, 14, 'skeleton', 2, 'crypt');
    add(pick(ESPECTRO_PHRASES, 1), 38, 22, 'specter', 4, 'crypt');
    add(pick(ESQUELETO_PHRASES, 1), 56, 14, 'skeleton', 3, 'crypt');
    add(pick(ESPECTRO_PHRASES, 2), 56, 24, 'specter', 5, 'crypt');
    add(pick(ESQUELETO_PHRASES, 2), 56, 35, 'skeleton', 6, 'crypt');
    add(pick(ESPECTRO_PHRASES, 3), 38, 32, 'specter', 7, 'crypt');
    add(pick(ESQUELETO_PHRASES, 1), 62, 35, 'skeleton', 4, 'crypt');
    add(
      {
        name: 'Director espectro',
        presentationLine: 'O director espectro bloquea o final do pasillo.',
        battleQuote: 'Picholeiro do ensino? Non. Retranca con notas suspensas.',
        characterId: 'peleteiro-director',
      },
      38,
      38,
      'director',
      12,
      'crypt'
    );
  }

  return list;
}
