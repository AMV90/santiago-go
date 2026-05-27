/**
 * Personalidades dos cidadáns (bots verdes) — frases elocuentes ao premer espazo.
 */
export const CITIZEN_PERSONALITIES = [
  {
    id: 'peregrino',
    label: 'Peregrino',
    phrases: [
      'O Camiño ensíname que cada paso ten sentido.',
      'Levo tres semanas de botas e aínda me queda alma por gastar.',
      'Se ves a Praza do Obradoiro baleirada, é que chegaches cedo.',
      'Un café e un bocadillo, e o mundo volve ser amable.',
    ],
  },
  {
    id: 'comerciante',
    label: 'Comerciante',
    phrases: [
      'Hoxe abrimos cedo: o mercado non espera a ninguén.',
      'O millo bo déixao secar ao sol, non á pressa.',
      'Un cliente educado vale máis que dez rebullos.',
      'En Santiago todo o mundo acaba pasando pola túa porta.',
    ],
  },
  {
    id: 'abuela',
    label: 'Veciña',
    phrases: [
      'Antes esta rúa coñecíana de memoria, rapaz.',
      'Se chove, agarda debaixo do arco; o granizo non perdona.',
      'A cidade está bonita, pero cóidate dos que van depressa.',
      'Un ola sincero abre máis portas que mil chaves.',
    ],
  },
  {
    id: 'estudiante',
    label: 'Estudiante',
    phrases: [
      'Levo o campus na mochila e Santiago na cabeza.',
      'Exames, tapas e bus — así se aprende a vivir.',
      'O bibliotecario sabe máis ca Google, créeme.',
      'Se ves a alguén cos auriculares, probablemente leva Bach.',
    ],
  },
  {
    id: 'artesao',
    label: 'Artesán',
    phrases: [
      'As mans lembran o oficio cando a cabeza se distrae.',
      'A prata non se afoba; mírase e respírase.',
      'Cada peza leva o nome de quen a encargou, aínda que non o saiba.',
      'O barrio chega enteiro cando alguén pregunta polo traballo ben feito.',
    ],
  },
  {
    id: 'jubilado',
    label: 'Xubilado',
    phrases: [
      'Paseo sen reloxo: é o luxo que me gañei.',
      'O sol de mañá paga o que a chuvia de onte roubou.',
      'Coñezo o banco de cada praza; son os meus despachos.',
      'A xuventude vai depressa, pero a cidade queda.',
    ],
  },
  {
    id: 'turista',
    label: 'Visitante',
    phrases: [
      'Vin buscar a estrela e atopei decontado conversa.',
      'O mapa mente; o cheiro a tarta de Santiago, non.',
      'A primeira vez aquí parece un soño con pan.',
      'Levo máis fotos ca memoria, e aínda me falta rúa.',
    ],
  },
  {
    id: 'profesor',
    label: 'Profesor',
    phrases: [
      'A curiosidade é a única licenza que nunca caduca.',
      'Un libro aberto na Alameda vale por catro aulas.',
      'Preguntar ben é máis difícil ca responder.',
      'Santiago ensina historia sen pedir entrada.',
    ],
  },
];

export function pickPersonality(index = Math.floor(Math.random() * CITIZEN_PERSONALITIES.length)) {
  return CITIZEN_PERSONALITIES[index % CITIZEN_PERSONALITIES.length];
}

export function randomPhrase(personality) {
  const list = personality?.phrases;
  if (!list?.length) return 'Bo día, veciño.';
  return list[Math.floor(Math.random() * list.length)];
}
