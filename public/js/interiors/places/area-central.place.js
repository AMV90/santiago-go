import {
  buildAreaCentralLayout,
  AREA_CENTRAL_SHOPPER_SLOTS,
} from '../layouts/area-central.layout.js';
import { drawAreaCentralDoor } from '../door-art.js';
import { AREA_CENTRAL } from '../../map-bounds.js';

const OUTLET_PHRASES = [
  'Outlet a -70 %… isto non se ve cada día, nin cada década.',
  'Busco zapatillas de outlet, non de escaparate con actitude.',
  'Marca premium a prezo de saldo. O meu banco non aplaude, eu si.',
  'Unha bolsa máis e pechemos a tarde… ou a conta, primeiro.',
  'Isto si que é Área Central, nena. O parque no medio é o descanso.',
  'Desconto do 50 %? Pois dous pares. A matemática do outlet é fermosa.',
  'Vinde de outlet, volvede cargados e coa fe rota do cartón.',
  'A tempada pasada aquí a metade; este ano, a metade máis un suéter.',
  'Compro agora, penso despois. Despois sempre chega tarde.',
  'Talla XL en rebajas — o meu día de sorte e o teu de cola.',
  'Marido espera no sofá; eu na galería, que é máis divertido.',
  'De quen ves sendo? Con ese carriño, de quen ten cupón caducado.',
  'Xa me quero xubilar, pero as rebajas non me deixan en paz.',
  'Se non leva etiqueta vermella, non me interesa. Retranca de compradora.',
  'Alcampo ao fondo, café no medio, culpa no final.',
  'Picholeiro do outlet? Non, pero sei negociar como un profesional.',
];

export const areaCentralPlace = {
  id: 'area-central',
  label: 'Área Central · 500×500 m',
  enterToast: 'Entraches ao Área Central (outlet)',
  exitToast: 'Saíches do Área Central',
  world: { kind: 'lonlat', lon: AREA_CENTRAL.lon, lat: AREA_CENTRAL.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildAreaCentralLayout,
  door: {
    textureKey: 'door-area-central',
    draw: drawAreaCentralDoor,
    tooltip: 'Área Central',
    sceneKey: 'areaCentralDoor',
  },
  actors: {
    chatter: {
      spriteRole: 'bot',
      defaultEmoji: '🛍️',
      intervalMs: 7500,
      bubbleBg: '#d4f0d4',
      bubbleColor: '#1a3d1a',
      wordWrap: 155,
      patrons: AREA_CENTRAL_SHOPPER_SLOTS.map((slot, i) => ({
        id: slot.id,
        tx: slot.tx,
        ty: slot.ty,
        tint: [0xa5d6a7, 0x81c784, 0x66bb6a, 0x4caf50, 0xffcc80][i % 5],
        phrases: OUTLET_PHRASES,
      })),
    },
  },
};
