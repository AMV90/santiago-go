import { buildMercadoAbastosLayout, MERCADO_ABASTOS_PATRONS } from './mercado-abastos.layout.js';
import { buildMuseoPoboGalegoLayout, MUSEO_POBO_GALEGO_PATRONS } from './museo-pobo-galego.layout.js';
import { buildHostalReisCatolicosLayout, HOSTAL_REIS_CATOLICOS_PATRONS } from './hostal-reis-catolicos.layout.js';
import { buildConventoSanFranciscoLayout, CONVENTO_SAN_FRANCISCO_PATRONS } from './convento-san-francisco.layout.js';
import { buildPazoRaxoiLayout, PAZO_RAXOI_PATRONS } from './pazo-raxoi.layout.js';
import { buildBibliotecaAnxelCasalLayout, BIBLIOTECA_ANXEL_CASAL_PATRONS } from './biblioteca-anxel-casal.layout.js';
import { buildAuditorioGaliciaLayout, AUDITORIO_GALICIA_PATRONS } from './auditorio-galicia.layout.js';
import { buildCidadeCulturaLayout, CIDADE_CULTURA_PATRONS } from './cidade-cultura.layout.js';
import { buildMuseoPeregrinacionsLayout, MUSEO_PEREGRINACIONS_PATRONS } from './museo-peregrinacions.layout.js';
import { buildCasaDaTroyaLayout, CASA_DA_TROYA_PATRONS } from './casa-da-troya.layout.js';
import { buildParqueBonavalLayout, PARQUE_BONAVAL_PATRONS } from './parque-bonaval.layout.js';
import { buildPalacioCongresosLayout, PALACIO_CONGRESOS_PATRONS } from './palacio-congresos.layout.js';
import { buildAsCancelasLayout, AS_CANCELAS_PATRONS } from './as-cancelas.layout.js';
import { buildEstadioSanLazaroLayout, ESTADIO_SAN_LAZARO_PATRONS } from './estadio-san-lazaro.layout.js';
import { buildCgacLayout, CGAC_PATRONS } from './cgac.layout.js';
import { buildSanMartinPinarioLayout, SAN_MARTIN_PINARIO_PATRONS } from './san-martin-pinario.layout.js';
import { buildColexioSanClementeLayout, COLEXIO_SAN_CLEMENTE_PATRONS } from './colexio-san-clemente.layout.js';
import { buildMuseoCatedralLayout, MUSEO_CATEDRAL_PATRONS } from './museo-catedral.layout.js';
import { buildParqueAlamedaLayout, PARQUE_ALAMEDA_PATRONS } from './parque-alameda.layout.js';
import { buildMuseoTerraSantaLayout, MUSEO_TERRA_SANTA_PATRONS } from './museo-terra-santa.layout.js';

/** Planta e posicións de visitantes por id de sitio */
export const SITE_LAYOUT_REGISTRY = {
  'mercado-abastos': { build: buildMercadoAbastosLayout, patrons: MERCADO_ABASTOS_PATRONS },
  'museo-pobo-galego': { build: buildMuseoPoboGalegoLayout, patrons: MUSEO_POBO_GALEGO_PATRONS },
  'hostal-reis-catolicos': { build: buildHostalReisCatolicosLayout, patrons: HOSTAL_REIS_CATOLICOS_PATRONS },
  'convento-san-francisco': { build: buildConventoSanFranciscoLayout, patrons: CONVENTO_SAN_FRANCISCO_PATRONS },
  'pazo-raxoi': { build: buildPazoRaxoiLayout, patrons: PAZO_RAXOI_PATRONS },
  'biblioteca-anxel-casal': { build: buildBibliotecaAnxelCasalLayout, patrons: BIBLIOTECA_ANXEL_CASAL_PATRONS },
  'auditorio-galicia': { build: buildAuditorioGaliciaLayout, patrons: AUDITORIO_GALICIA_PATRONS },
  'cidade-cultura': { build: buildCidadeCulturaLayout, patrons: CIDADE_CULTURA_PATRONS },
  'museo-peregrinacions': { build: buildMuseoPeregrinacionsLayout, patrons: MUSEO_PEREGRINACIONS_PATRONS },
  'casa-da-troya': { build: buildCasaDaTroyaLayout, patrons: CASA_DA_TROYA_PATRONS },
  'parque-bonaval': { build: buildParqueBonavalLayout, patrons: PARQUE_BONAVAL_PATRONS },
  'palacio-congresos': { build: buildPalacioCongresosLayout, patrons: PALACIO_CONGRESOS_PATRONS },
  'as-cancelas': { build: buildAsCancelasLayout, patrons: AS_CANCELAS_PATRONS },
  'estadio-san-lazaro': { build: buildEstadioSanLazaroLayout, patrons: ESTADIO_SAN_LAZARO_PATRONS },
  cgac: { build: buildCgacLayout, patrons: CGAC_PATRONS },
  'san-martin-pinario': { build: buildSanMartinPinarioLayout, patrons: SAN_MARTIN_PINARIO_PATRONS },
  'colexio-san-clemente': { build: buildColexioSanClementeLayout, patrons: COLEXIO_SAN_CLEMENTE_PATRONS },
  'museo-catedral': { build: buildMuseoCatedralLayout, patrons: MUSEO_CATEDRAL_PATRONS },
  'parque-alameda': { build: buildParqueAlamedaLayout, patrons: PARQUE_ALAMEDA_PATRONS },
  'museo-terra-santa': { build: buildMuseoTerraSantaLayout, patrons: MUSEO_TERRA_SANTA_PATRONS },
};

export function getSiteLayout(siteId) {
  return SITE_LAYOUT_REGISTRY[siteId] ?? null;
}
