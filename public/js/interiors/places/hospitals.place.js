import { buildHospitalLayout, HOSPITAL_RECEPTIONIST } from '../layouts/hospital.layout.js';
import { HEALING_SITES } from '../../healing-sites-data.js';

/** Unha instancia interior por cada hospital do mapa */
export const hospitalPlaces = HEALING_SITES.map((site) => ({
  id: `hospital-${site.id}`,
  label: site.shortName,
  enterToast: `Entraches en ${site.shortName}`,
  exitToast: `Saíches de ${site.name}`,
  world: { kind: 'lonlat', lon: site.lon, lat: site.lat },
  exit: { kind: 'south', margin: 2.5 },
  layout: buildHospitalLayout,
  actors: {
    receptionist: {
      ...HOSPITAL_RECEPTIONIST,
    },
  },
}));
