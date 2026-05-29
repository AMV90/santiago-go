/**
 * Personalidades dos cidadáns (bots) — frases ao premer espazo.
 * Referencias: Camiño, Obradoiro, Alameda, Rúa do Franco, USC, Mercado, Sar…
 */
import { BOT_PERSONALITY_MAP } from './bot-personality-map.js';

export const CITIZEN_PERSONALITIES = [
  {
    id: 'peregrino',
    label: 'Peregrino',
    phrases: [
      'O Camiño ensíname que cada paso ten sentido… e cada blíster tamén.',
      'Levo tres semanas de botas: cheiro a vento, crema de pisadas e ilusión.',
      'Se ves o Obradoiro baleiro, é que chegaches antes ca multa da praza.',
      'Un café na Porta Faxeira e o mundo volve ser de fiar.',
      'A mochila pesa, pero a conciencia vai máis lixeira ca na meta 100.',
      'O último kilómetro sempre cheira a tarta de Santiago… ou a ambulancia, depende.',
    ],
  },
  {
    id: 'comerciante',
    label: 'Comerciante',
    phrases: [
      'Hoxe abrimos cedo: o Mercado de Abastos non espera nin ao alcalde.',
      'Na Rúa do Franco o cliente educado abre portas; o chulo abre Google reviews.',
      'Se non che cheira a marisco fresco, non é peixe: é postal de Riazor.',
      'En Santiago todo o mundo acaba pasando pola túa porta… ou pola do de en fronte.',
      'O millo bo sécase ao sol da praza, non ao flash do móbil.',
      'Feito en Compostela — que non é o mesmo que «estilo Compostela» feito en Madrid.',
    ],
  },
  {
    id: 'abuela',
    label: 'Veciña',
    phrases: [
      'Antes esta rúa coñecíana de memoria, rapaz. Agora coñézoa de Google Maps.',
      'Se chove, agarda debaixo do arco da praza; o paraugas novo xa o perderás.',
      'A cidade está bonita, pero cóidate dos que van como se fosen o AVE a Chamartín.',
      'Un ola sincero abre máis portas que mil chaves… e que mil apps de reparto.',
      'De quen ves sendo? Con esa cara, da tía de Monforte, seguro.',
      'Na Alameda o banco é meu desde o 78. Non discutas, senta ao lado.',
    ],
  },
  {
    id: 'estudiante',
    label: 'Estudiante',
    phrases: [
      'Levo o campus da USC na mochila e Santiago na cabeza… e a tese no limbo.',
      'Exames, tapas e bus da L7: así se fai a carreira oficial.',
      'O bibliotecario da USC sabe máis ca ChatGPT, e ademais non che cobra premium.',
      'Se ves auriculares, pode ser Bach ou reggaetón desde Conxo. Apostamos?',
      'Ermos máis de grelos con cachelo ou de picholeiro? Depende do día e do bolso.',
      'A biblioteca pechou ás dez… e eu pensaba que era 24 horas como na serie.',
    ],
  },
  {
    id: 'artesao',
    label: 'Artesán',
    phrases: [
      'As mans lembran o oficio cando a cabeza mira o móbil na praza de Praterías.',
      'A prata da Rúa Nova non se afoba: mírase, respírase e non se presta.',
      'Cada peza leva o nome de quen a encargou, aínda que non o saiba.',
      'Preguntar polo traballo ben feito é o mellor cumprido desta cidade.',
      'Feito en Compostela — con vento atlántico incluído, sen recargo.',
      'O turista pregunta por que é caro; o local sabe por que dura.',
    ],
  },
  {
    id: 'jubilado',
    label: 'Xubilado',
    phrases: [
      'Xa toca xubilarme… ou xubilarme outra vez, que a primeira non colou.',
      'Paseo sen reloxo pola Alameda: é o luxo que me gañei a pulso.',
      'O sol de mañá paga o que a chuvia de onte roubou con xuros bancarios.',
      'Coñezo o banco de cada praza: son os meus despachos sen IVA.',
      'Cando me xubilei, o botafumeiro aínda me saudaba por nome.',
      'Os mozos din «OK»; nós dicíamos «vale» e dabámonos por satisfeitos co cachelo.',
    ],
  },
  {
    id: 'turista',
    label: 'Visitante',
    phrases: [
      'Vin buscar a estrela e atopei conversa, chuvia e empanada na praza.',
      'O mapa mente; o cheiro a tarta de Santiago, non.',
      'A primeira vez no Obradoiro parece un soño con pan e con fila.',
      'Levo máis fotos ca memoria, e aínda me falta a Fonte dos Cabalos.',
      'Dixéronme que diga «bo día» e xa son medio local… ata que chove.',
      'O guía dixo «cinco minutos» e levo dúas horas mirando a fachada.',
    ],
  },
  {
    id: 'profesor',
    label: 'Profesor',
    phrases: [
      'A curiosidade é a única licenza que nunca caduca… nin con recargo universitario.',
      'Un libro aberto na Alameda vale por catro aulas e medio café da USC.',
      'Preguntar ben é máis difícil ca responder; falar ben, máis aínda.',
      'Santiago ensina historia sen pedir entrada, pero con examen oral na praza.',
      'O alumno que chega tarde sempre ten unha anécdota épica do Camiño.',
      'Na facultade dinse que chove máis dentro ca fóra. Non o confirmo por escrito.',
    ],
  },
  {
    id: 'retrancero',
    label: 'Retrancero',
    phrases: [
      'A retranca non é ser malo: é non regalar o riso a calquera turista.',
      'Dixéronme «buenos días» en castelán e respondín en horario laboral galego.',
      'Se o vento sopra do nordeste, non saio; se sopra do noroeste, tampouco.',
      'O mellor Camiño remata en cunca de queixo e sen prisas de guía.',
      'Picholeiro? Iso é arte; o resto son opinións con pantalón curto.',
      'Ermos máis de cachelo ou de grelos? Depende de quen pague a ronda na praza.',
    ],
  },
  {
    id: 'maior',
    label: 'Maior',
    phrases: [
      'De quen ves sendo? Con eses ollos, do cura da parroquia, xa verás.',
      'Quero xubilarme, pero o meu corpo aínda non asinou os papeis do concello.',
      'Antes íamos á feira a pé; agora vaise en coche e queixámonos do tráfico do Sar.',
      'Os mozos din «OK»; nós dicíamos «vale» e dabámonos por satisfeitos.',
      'Se che invitan a grelos, di que si; se che invitan sen cachelo, desconfía.',
      'A cidade medra, pero o banco da praza segue sendo o meu despacho oficial.',
    ],
  },
  {
    id: 'hosteleira',
    label: 'Hosteleira',
    phrases: [
      'Na hostal temos cama, manta e conversa… a ducha quente, se pagas antes.',
      'O peregrino chega ás once da noite coa historia do día e a toalla mollada.',
      'Se preguntas onde está o Obradoiro, apunto co dedo: «sempre alí arriba».',
      'A cola do baño é internacional: alemán, coreano e galego de Sar.',
      'Outra mochila perdida? Terceira esta semana. Santiago acumula historias.',
      'A sábado hai peixe no Mercado; aviso aos da cama oito para que cheguen cedo.',
    ],
  },
  {
    id: 'guia',
    label: 'Guía',
    phrases: [
      'Seguidme: o Pórtico da Gloria non se explica, emociónase.',
      'A praza do Obradoiro ten o seu ritmo; o noso grupo tamén, se non se distrae.',
      'Foto rápida, por favor: detrás ven outro grupo e outro guía máis rápido.',
      'O botafumeiro non sae cando queres; sae cando a catedral decide.',
      'A Rúa do Franco é historia… e cheiro a tapas. Os dous van incluídos.',
      'Se perdédesme, buscade a bandeiña azul ou preguntade polo guía cansado.',
    ],
  },
  {
    id: 'mariscador',
    label: 'Mariscador',
    phrases: [
      'O pulpo de hoxe chegou de Rianxo; se cheira a mar, confía.',
      'No Mercado mírase o ollo do peixe antes ca foto do Instagram.',
      'Cachelos sí, pero o marisco manda na praza cando sopra o nordeste.',
      'O turista pregunta «é fresco?»; eu respondo «é Compostela, non é deserto».',
      'Ás seis da mañá o peixe non negocia; negocian os turistas ás doce.',
      'Se chove, o marisco sabe mellor… ou iso me contou o meu avó na praza.',
    ],
  },
  {
    id: 'gaiteiro',
    label: 'Gaiteiro',
    phrases: [
      'A gaita avisa dende lonxe: ou che gusta ou busca outra praza.',
      'Na praza do Obradoiro o eco perdoa máis notas ca xente.',
      'Unha muiñeira ben tocada abre máis bolsillos ca discurso do alcalde.',
      'Se chove, a funda da gaita primeiro; o gaiteiro, despois.',
      'O turista baila mal, pero baila feliz. Iso tamén é Santiago.',
      'Ás doce toco para min; ás seis, para quen pasea coa estrela na mochila.',
    ],
  },
  {
    id: 'ciclista',
    label: 'Ciclista',
    phrases: [
      'Subir ao Gozo en bici é relixión; baixar, confesión.',
      'O carril da Alameda compártese: paciencia, timbre e un «perdón» sincero.',
      'Se ves lama nos zapatos, pode ser peregrino; se ves nos neumáticos, fui eu.',
      'O Camiño en bici: menos blísters, máis pinchazos. Escolles o teu sufrimento.',
      'Na praza aparco onde non molesto… ou onde non vexen, depende do día.',
      'Chove? Pois manguitos e a loita contra o vento da USC ata Sar.',
    ],
  },
  {
    id: 'foraneiro',
    label: 'Foraneiro',
    phrases: [
      'Volvín a Compostela despois de vinte anos: as rúas, iguais; os prezos, novela.',
      'Falo galego con acento de emigrante, pero o corazón en code-switching.',
      'A casa da infancia agora é hostal. Alomenos segue acollendo xente.',
      'O sota oíno en Madrid; aquí sábeome a permiso para respirar.',
      'Tráeme cachelos da terra e eu contoche historias do barrio de antes.',
      'Santiago cambia, pero o cheiro a pan cando chove, ese non.',
    ],
  },
];

const byId = Object.fromEntries(CITIZEN_PERSONALITIES.map((p) => [p.id, p]));

export function personalityById(id) {
  return byId[id] ?? CITIZEN_PERSONALITIES[0];
}

export function pickPersonality(index = Math.floor(Math.random() * CITIZEN_PERSONALITIES.length)) {
  return CITIZEN_PERSONALITIES[index % CITIZEN_PERSONALITIES.length];
}

/** Personalidade do bot-N (mapa xerado por expand-lpc-roster). */
export function getPersonalityForBotIndex(index) {
  const id = BOT_PERSONALITY_MAP[`bot-${index % 104}`];
  return personalityById(id);
}

export function randomPhrase(personality) {
  const list = personality?.phrases;
  if (!list?.length) return 'Bo día, veciño. Ou boa tarde, que tamén vale.';
  return list[Math.floor(Math.random() * list.length)];
}
