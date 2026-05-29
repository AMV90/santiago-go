/**
 * 20 zonas interiores de Santiago — coordenadas OSM + diálogos con voz local.
 */
export const SANTIAGO_SITES = [
  {
    id: 'mercado-abastos',
    label: 'Mercado de Abastos',
    layout: 'market',
    door: 'market',
    lon: -8.541214,
    lat: 42.8799775,
    osmRef: 'way/43280827',
    exitStreet: 'Praza de San Fiz de Solovio',
    emoji: '🐟',
    patrons: [
      {
        phrases: [
          'Marisco do día, de feira e de confianza — non de folleto.',
          'Un kilo de berberechos e seguimos… ou non, tamén está ben.',
          'Aquí o pemento ten sabor; o de supermercado ten etiqueta.',
          'De quen ves sendo? Con esa bolsa, de quen vai a cociñar de verdade.',
        ],
      },
      {
        phrases: [
          'Cola na peixaría, pero vale a pena como cola do Obradoiro.',
          'Levo o caldo para o domingo: a nai dixera «non che faltará».',
          'Picholeiro do mostrador? Non, pero corta melhor ca moitos chefs.',
          'Xa me quero xubilar, pero o mercado abre antes ca min.',
        ],
      },
    ],
  },
  {
    id: 'museo-pobo-galego',
    label: 'Museo do Pobo Galego',
    layout: 'museum',
    door: 'museum',
    lon: -8.5390809,
    lat: 42.8828548,
    osmRef: 'node/12526086775',
    exitStreet: 'Costa de San Domingos',
    emoji: '🏛️',
    patrons: [
      {
        phrases: [
          'Esta noria xa viu máis invernos ca eu e mira que teño anos.',
          'O galego tamén se conta con obxectos, non só con memes.',
          'Se o guía fala depressa, é que lle queda o bus.',
        ],
      },
      {
        phrases: [
          'Bonaval é historia viva; eu son visitante con dor nas pernas.',
          'Foto permitida, flash non — e selfie con modestia, por favor.',
          'Ermos máis de tradición ou de moderno? Aquí, de tradición ben explicada.',
        ],
      },
    ],
  },
  {
    id: 'hostal-reis-catolicos',
    label: 'Hostal dos Reis Católicos',
    layout: 'civic',
    door: 'civic',
    lon: -8.5459201,
    lat: 42.8814572,
    osmRef: 'relation/206772',
    exitStreet: 'Praza do Obradoiro',
    emoji: '🏨',
    patrons: [
      {
        phrases: [
          'Parador de cinco estrelas: aquí durmiron reis e hoxe durmimos nós con factura.',
          'O claustro é tan fermoso que até o silencio ten boa educación.',
          'De quen ves sendo? Con ese traxe, de quen veu a boda doutro.',
        ],
      },
      {
        phrases: [
          'Cola na recepción, pero con encanto. Retranca de cinco estrelas.',
          'Un café no patio e a vida parece un anuncio… caro, pero bonito.',
          'Se me xubilo, vou pedir habitación con vista ao Obradoiro. Soño.',
        ],
      },
    ],
  },
  {
    id: 'convento-san-francisco',
    label: 'Convento de San Francisco',
    layout: 'church',
    door: 'church',
    lon: -8.5455926,
    lat: 42.8838501,
    osmRef: 'relation/20690547',
    exitStreet: 'Rúa do Campiño de San Francisco',
    emoji: '⛪',
    patrons: [
      {
        phrases: [
          'Val de Deus: silencio, pedra e poucas notificacións no móbil.',
          'O claustro convida a parar; o reloxo convida a correr. Eu quedo.',
          'A campá soou; o corazón tamén, pero máis baixiño.',
        ],
      },
      {
        phrases: [
          'Historia franciscana en cada arco e un chiste malo na entrada. Perdón.',
          'Se falas alto, o eco te corrige de balde.',
          'De quen ves sendo? Con esa calma, de quen necesitaba hoxe isto.',
        ],
      },
    ],
  },
  {
    id: 'pazo-raxoi',
    label: 'Pazo de Raxoi',
    layout: 'civic',
    door: 'civic',
    lon: -8.5461956,
    lat: 42.880363,
    osmRef: 'relation/17048057',
    exitStreet: 'Praza do Obradoiro',
    emoji: '🏛️',
    patrons: [
      {
        phrases: [
          'Concello e mirador: dende aquí os peregrinos parecen formigas con ilusión.',
          'Balcón perfecto para ver chegar xente e irse contando historias.',
          'Acto oficial á tarde: traxe, papeis e café forte por detrás.',
        ],
      },
      {
        phrases: [
          'Foto desde a praza, non desde dentro, que tamén hai regras con retranca.',
          'O reloxo dá as horas; o concello dá as voltas. As dúas funcionan.',
          'Xa me quero xubilar do protocolo, non da cidade.',
        ],
      },
    ],
  },
  {
    id: 'biblioteca-anxel-casal',
    label: 'Biblioteca Ánxel Casal',
    layout: 'library',
    door: 'library',
    lon: -8.544089,
    lat: 42.8837102,
    osmRef: 'way/178564588',
    exitStreet: 'Avenida de Xoán XXIII',
    emoji: '📚',
    patrons: [
      {
        phrases: [
          'Silencio na sala, por favor. O chiste vaise ao pasillo.',
          'Reservo o ensaio sobre o Camiño; devólvo o drama antes do venres.',
          'O bibliotecario sabe máis ca Wikipedia e ademais te mira con cariño.',
        ],
      },
      {
        phrases: [
          'WiFi estable — milagre urbano comparable ao botafumeiro.',
          'De quen ves sendo? Con eses apuntes, de quen vai aprobar, seguro.',
          'Ermos máis de novela ou de tese? Aquí, de quen leva as dúas.',
        ],
      },
    ],
  },
  {
    id: 'auditorio-galicia',
    label: 'Auditorio de Galicia',
    layout: 'civic',
    door: 'civic',
    lon: -8.5446377,
    lat: 42.8896283,
    osmRef: 'way/99612594',
    exitStreet: 'Avenida do Burgo das Nacións',
    emoji: '🎵',
    patrons: [
      {
        phrases: [
          'Concerto esta noite: entradas esgotadas e ilusión en stock.',
          'A acústica é tan boa que até o tose da fila de atrás con estilo.',
          'Ensaio xeral ao fondo: notas sueltas buscando casa.',
        ],
      },
      {
        phrases: [
          'Orquestra de Galicia: non faltes, que despois chóasese na cola do bar.',
          'Se cantas no asento, cántate no baño. Recomendación de amigo.',
          'De quen ves sendo? Con ese programa na man, de quen vai chorar no final.',
        ],
      },
    ],
  },
  {
    id: 'cidade-cultura',
    label: 'Cidade da Cultura',
    layout: 'civic',
    door: 'civic',
    lon: -8.5257375,
    lat: 42.8710668,
    osmRef: 'way/80430667',
    exitStreet: 'Monte Gaiás',
    emoji: '🏗️',
    patrons: [
      {
        phrases: [
          'Arquitectura de outro planeta; as pernas, de este mundo e cansadas.',
          'Subida longa, pero as vistas pagan con xuros de satisfacción.',
          'O vento no Gaiás peitea máis ca peiteira do século XVIII.',
        ],
      },
      {
        phrases: [
          'Exposición temporal: hoxe toca pensar; mañá, toca contalo mal.',
          'Se te perdes, non te preocupes: aquí todos nos perdemos con estilo.',
          'Picholeiro da cultura? Non, pero aprecio un bo edificio con humor.',
        ],
      },
    ],
  },
  {
    id: 'museo-peregrinacions',
    label: 'Museo das Peregrinacións',
    layout: 'museum',
    door: 'museum',
    lon: -8.5427723,
    lat: 42.8823425,
    osmRef: 'node/11459973048',
    exitStreet: 'Praza de San Miguel dos Agros',
    emoji: '🥾',
    patrons: [
      {
        phrases: [
          'A bota de 500 km está aquí; a miña de 500 metros tamén merece museo.',
          'Cada credencial conta unha historia; a miña, tres paradas e fame.',
          'Camiño Francés ben explicado; as dores, tamén, pero sen mapa.',
        ],
      },
      {
        phrases: [
          'Compostela ao final, sempre. O principio, ás veces, en dúbida.',
          'De quen ves sendo? Con esa mochila, de quen xa viu a estrela.',
          'Se che falta a compostela, pídela na tenda de en fronte.',
        ],
      },
    ],
  },
  {
    id: 'casa-da-troya',
    label: 'Casa da Troia',
    layout: 'museum',
    door: 'museum',
    lon: -8.5433968,
    lat: 42.8814726,
    osmRef: 'way/193126887',
    exitStreet: 'Rúa da Troia',
    emoji: '🎓',
    patrons: [
      {
        phrases: [
          'Vida de estudante en miniatura: risas, botellas e exames no horizonte.',
          'Troia: onde a noite era longa e a mañá, un proxecto.',
          'Non toques o vitral; toca estudar, dixo alguén que non cumpriu.',
        ],
      },
      {
        phrases: [
          'Exposición de botellas: cada unha un verán e medio drama.',
          'De quen ves sendo? Con esa nostalgia, de quen durmiu aquí unha vez.',
          'Ermos máis de festa ou de biblioteca? En Troia, a resposta é «si».',
        ],
      },
    ],
  },
  {
    id: 'parque-bonaval',
    label: 'Parque de Bonaval',
    layout: 'park',
    door: 'park',
    lon: -8.5381814,
    lat: 42.8832348,
    osmRef: 'way/78595398',
    exitStreet: 'Bonaval',
    emoji: '🌳',
    patrons: [
      {
        phrases: [
          'Sombra, carballos e noria: tríade perfecta para non ter prisa.',
          'Ideal para ler despois do museo, ou para non ler e soñar.',
          'Os paxaros mandan aquí; nós só alugamos o banco.',
        ],
      },
      {
        phrases: [
          'Paseo tranquilo antes de subir á vella, que a vella tamén cansa.',
          'Se escoitas ben, o río conta chistes malos. Retranca hídrica.',
          'Xa me quero xubilar neste banco. Pero chove ás veces.',
        ],
      },
    ],
  },
  {
    id: 'palacio-congresos',
    label: 'Palacio de Congresos',
    layout: 'civic',
    door: 'civic',
    lon: -8.512008,
    lat: 42.8850853,
    osmRef: 'way/9861605',
    exitStreet: 'San Lázaro',
    emoji: '🎤',
    patrons: [
      {
        phrases: [
          'Congreso internacional: gravatas, acreditacións e café industrial.',
          'Cola no acreditamento como cola do mercado, pero con nome no peito.',
          'Coffee break: onde se negocia o mundo en bocadillos.',
        ],
      },
      {
        phrases: [
          'Feira de turismo abaixo: mapas, folletos e promesas de sol.',
          'De quen ves sendo? Con esa pasta, de quen pon PowerPoint.',
          'Se o wifi falla, a conversa mellora. Experiencia universal.',
        ],
      },
    ],
  },
  {
    id: 'as-cancelas',
    label: 'Centro Comercial As Cancelas',
    layout: 'mall',
    door: 'mall',
    lon: -8.5264733,
    lat: 42.8892367,
    osmRef: 'way/158258786',
    exitStreet: 'Rúa do Vinte e Cinco de Xullo',
    emoji: '🛒',
    patrons: [
      {
        phrases: [
          'Compras e chuvia: plan perfecto con culpa incluída.',
          'O supermercado está abaixo; a tentación, en todas as plantas.',
          'Rebajas nas zapatillas: o pé aplaude, a carteira chora.',
        ],
      },
      {
        phrases: [
          'Praza de comidas ao mediodía: olor a fritura e a decisións difíciles.',
          'De quen ves sendo? Con ese carriño, de quen ten cupón e tempo.',
          'Xa me quero xubilar das escaleiras mecánicas. Suben soas.',
        ],
      },
    ],
  },
  {
    id: 'estadio-san-lazaro',
    label: 'Estadio de San Lázaro',
    layout: 'stadium',
    door: 'stadium',
    lon: -8.5168424,
    lat: 42.8827067,
    osmRef: 'relation/8092637',
    exitStreet: 'San Lázaro',
    emoji: '⚽',
    patrons: [
      {
        phrases: [
          'Partido domingo: veño coa bufanda e coa voz estragada de antes.',
          'Verónica Boquete: nome de lenda e de escola aquí preto.',
          'Céspede novo, ollo ás botas e ao árbitro con desconfianza saudable.',
        ],
      },
      {
        phrases: [
          'Entrenamento aberto á tarde: gratis e con opinión incluída.',
          'Gol anulado? Conversa de bar garantida durante unha semana.',
          'Picholeiro do campo? O porteiro, se queres, pero con guantes.',
        ],
      },
    ],
  },
  {
    id: 'cgac',
    label: 'CGAC',
    layout: 'museum',
    door: 'museum',
    lon: -8.5396243,
    lat: 42.8830029,
    osmRef: 'way/77444782',
    exitStreet: 'Bonaval',
    emoji: '🎨',
    patrons: [
      {
        phrases: [
          'Arte contemporánea: ou entendes, ou fas como que entendes. Eu finxo ben.',
          'Instalación no patio: impresionante e lixeiramente confusa. Perfecto.',
          'Catálogo na entrada; opinión forte na saída. Tradicional.',
        ],
      },
      {
        phrases: [
          'Foto só onde toca; o resto, memoria e conversa no café.',
          'De quen ves sendo? Con esa cara, de quen vai dicir «eu tamén podía».',
          'Se un quadro te mira, míralo tamén. Educación básica.',
        ],
      },
    ],
  },
  {
    id: 'san-martin-pinario',
    label: 'San Martín Pinario',
    layout: 'church',
    door: 'church',
    lon: -8.5442759,
    lat: 42.882135,
    osmRef: 'relation/2601597',
    exitStreet: 'Praza da Inmaculada',
    emoji: '⛪',
    patrons: [
      {
        phrases: [
          'Fachada barroca que non cabe na foto nin no móbil panorámico.',
          'Mosteiro benedictino: historia grande, silencio maior.',
          'A Inmaculada mira dende a praza; nós miramos de volta con respecto.',
        ],
      },
      {
        phrases: [
          'Misa en galego ás 19 h: idioma e campá, dúo clásico.',
          'Se o guía fala baixo, é que Deus tamén escoita aquí.',
          'Xa me quero xubilar no banco da praza. Misa opcional, sol obrigatorio.',
        ],
      },
    ],
  },
  {
    id: 'colexio-san-clemente',
    label: 'Colexio de San Clemente',
    layout: 'library',
    door: 'library',
    lon: -8.5470507,
    lat: 42.8778665,
    osmRef: 'relation/1436074',
    exitStreet: 'Praza de San Clemente',
    emoji: '📜',
    patrons: [
      {
        phrases: [
          'Pasantes do Camiño, século tras século, coa mesma dor nos pés.',
          'Piedra e pergamiño: Instagram non chega a este nivel.',
          'Lista de espera para a visita: como concerto, pero máis quieto.',
        ],
      },
      {
        phrases: [
          'Guía explicando a fachada; eu explicando por que cheguei tarde.',
          'De quen ves sendo? Con ese caderno, de quen vai facer historia.',
          'Ermos máis de arquivo ou de tapas? Hoxe, de arquivo con fame.',
        ],
      },
    ],
  },
  {
    id: 'museo-catedral',
    label: 'Museo da Catedral',
    layout: 'museum',
    door: 'museum',
    lon: -8.5451199,
    lat: 42.88023,
    osmRef: 'node/4769513269',
    exitStreet: 'Praza das Praterías',
    emoji: '✝️',
    patrons: [
      {
        phrases: [
          'O códice é ouro sobre pergamiño; eu son café sobre nervios.',
          'Pórtico da Gloria: réplica impresionante, orixinal indecente de bonito.',
          'Botafumeiro en vídeo 4K: o máis seguro para o teu nariz.',
        ],
      },
      {
        phrases: [
          'Non perdas a tapestra románica nin o tempo no regazo.',
          'De quen ves sendo? Con esa cara de asombro, de quen entendeu algo.',
          'Se o guía di «milagre», aplaude. Se di «horario», anota.',
        ],
      },
    ],
  },
  {
    id: 'parque-alameda',
    label: 'Parque da Alameda',
    layout: 'park',
    door: 'park',
    lon: -8.549475,
    lat: 42.8778705,
    osmRef: 'way/77511450',
    exitStreet: 'Alameda',
    emoji: '🌿',
    patrons: [
      {
        phrases: [
          'Carballos centenarios e pouca prisa: luxo que non está no outlet.',
          'Vista da Catedral dende o banco: postais gratis, sen fila.',
          'As dúas Marías están ali; eu estou aquí, tamén de estatua ás veces.',
          'De quen ves sendo? Con ese paseo, de quen veu a Ferradura enteiro.',
        ],
      },
      {
        phrases: [
          'Paseo de familias, turistas e patos con máis experiencia ca nós.',
          'Os patos non pagan entrada e saben o parque mellor ca guía.',
          'Capilla do Pilar preto; a Santa Susana no medio. Igrexa con plan.',
        ],
      },
      {
        phrases: [
          'Xa me quero xubilar neste banco da Alameda. Trámite pendente.',
          'A xuventude corre; eu camiño con estratexia e cachelo mental.',
          'Ermos máis de grelos ou de banco? Hoxe, de banco con sol.',
        ],
      },
      {
        phrases: [
          'Picholeiro do parque? Non, só un señor cos paxaros e retranca boa.',
          'Se chove, a Ferradura brilla; se sol, as Marías tamén.',
          'Este parque é grande de verdade: aquí perdese o tempo ben perdido.',
        ],
      },
    ],
  },
  {
    id: 'museo-terra-santa',
    label: 'Museo de Terra Santa',
    layout: 'museum',
    door: 'museum',
    lon: -8.5454623,
    lat: 42.8833605,
    osmRef: 'node/10974561133',
    exitStreet: 'Rúa de San Pedro',
    emoji: '🕯️',
    patrons: [
      {
        phrases: [
          'Reliquias e relatos de Xerusalén; eu relato de bus perdido en Santiago.',
          'Franciscanos contan o Camiño espiritual; eu conto o físico con blísters.',
          'Inciso en silencio na capela. O móbil, fóra ou en vibración culpable.',
        ],
      },
      {
        phrases: [
          'Cirio encendido: déixao estar, que tamén ten historia.',
          'De quen ves sendo? Con esa calma, de quen necesitaba respirar.',
          'Se che invitan a grelos despois, di que si. É outra relixión.',
        ],
      },
    ],
  },
];
