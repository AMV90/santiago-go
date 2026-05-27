import {
  buildAreaCentralLayout,
  AREA_CENTRAL_SHOPPER_SLOTS,
} from '../layouts/area-central.layout.js';
import { drawAreaCentralDoor } from '../door-art.js';
import { AREA_CENTRAL } from '../../map-bounds.js';

const OUTLET_PHRASES = [
  'Outlet a -70 %… isto non se ve cada día.',
  'Busco zapatillas de outlet, non de escaparate.',
  'Marca premium a prezo de saldo. Apaño!',
  'Unha bolsa máis e pechemos a tarde.',
  'Isto si que é Área Central, nena.',
  'Desconto do 50 %? Pois dous pares.',
  'Vinde de outlet, volvede cargados.',
  'A tempada pasada aquí a metade.',
  'Compro agora, penso despois.',
  'Talla XL en rebajas — o meu día de sorte.',
  'Alcampo ao fondo e despois máis tiendas…',
  'Parque ao centro, tiendas por dentro. Perfecto.',
  'Saco tres camisetas e un café.',
  'Se non leva etiqueta de outlet, non me interesa.',
  'Marido espera no sofá; eu na galería.',
  'Outfit entero por menos de trinta.',
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
