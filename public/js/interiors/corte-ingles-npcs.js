/** Clientes e dependentas — frases por planta (ECI Santiago). */

const PHRASES_BAJA = [
  'Esta zapatilla de montaña… para ir á praza do Obradoiro, si queres.',
  'O portátil está en informática; eu aínda busco a talla no deportes.',
  'Na librería atopan o Camiño en dez idiomas.',
  'O neno quere o carro de bebés; eu quero sentar na cafetería.',
];

const PHRASES_UNO = [
  'No Hipercor falta o leite e no Gourmet o foie… prioridades.',
  'A xoiería brilla máis ca a Catedral, e non exagero.',
  'Perfumería: probador número 4, cola eterna.',
  'Parafarmacia e prensa: compra rápida ou perder a tarde.',
];

const PHRASES_DOS = [
  'Moda muller á esquerda, home á dereita; non te confundas de arco.',
  'A lencería é discreta; a cola da caixa, non tanto.',
  'Probas tres tallas, compras a do medio. Lei do gran almacén.',
];

const PHRASES_TRES = [
  'No fogar atopas ata alfombras para o sofá da vindeira vida.',
  'O restaurante cheira ben; a conta tamén, supoño.',
  'Decoración textil: se non casa, volve o luns.',
];

export function getCorteInglesPatrons(floor) {
  const pools = [PHRASES_BAJA, PHRASES_UNO, PHRASES_DOS, PHRASES_TRES];
  const phrases = pools[floor - 1] ?? PHRASES_BAJA;
  const slots = {
    1: [
      { id: 'eci-b-deportes', tx: 18, ty: 18 },
      { id: 'eci-b-electronica', tx: 44, ty: 16 },
      { id: 'eci-b-libreria', tx: 68, ty: 16 },
      { id: 'eci-b-bebes', tx: 70, ty: 36 },
    ],
    2: [
      { id: 'eci-1-zap', tx: 16, ty: 18 },
      { id: 'eci-1-joy', tx: 42, ty: 14 },
      { id: 'eci-1-gourmet', tx: 26, ty: 38 },
      { id: 'eci-1-perf', tx: 68, ty: 14 },
    ],
    3: [
      { id: 'eci-2-muller', tx: 20, ty: 28 },
      { id: 'eci-2-home', tx: 54, ty: 28 },
      { id: 'eci-2-lenc', tx: 76, ty: 28 },
    ],
    4: [
      { id: 'eci-3-fogar', tx: 36, ty: 24 },
      { id: 'eci-3-rest', tx: 22, ty: 47 },
      { id: 'eci-3-cafe', tx: 68, ty: 47 },
    ],
  };

  return (slots[floor] ?? slots[1]).map((s, i) => ({
    ...s,
    tint: [0x90caf9, 0xffab91, 0xce93d8, 0xa5d6a7][i % 4],
    phrases,
  }));
}
